import {Graph, Node, PointLike} from '@antv/x6';
import {forkJoin, Observable, ReplaySubject} from 'rxjs';
import {GraphService} from '../services/graph.service';
import {RowCol} from './row-col';

export class Layout {
    private readonly nodeWidth: number;
    private readonly nodeHeight: number;
    private readonly cellPadding: number;
    private readonly randomOffset: number;
    private readonly containerWidth: number;
    private readonly containerHeight: number;
    private readonly gridCellWidth: number;
    private readonly gridCellHeight: number;
    private readonly graphZoom: number;

    private graph: Graph;
    private graphService: GraphService;
    private graphWidth: number;
    private graphHeight: number;
    private graphOriginX: number;
    private graphOriginY: number;
    private gridRowCount: number;
    private gridColCount: number;
    private gridCellCount: number;

    constructor(
        graph: Graph,
        graphService: GraphService,
        nodeWidth: number,
        nodeHeight: number,
        cellPadding: number,
        randomOffset: number = 0
    ) {
        this.graph = graph;
        this.graphService = graphService;
        this.nodeWidth = nodeWidth;
        this.nodeHeight = nodeHeight;
        this.cellPadding = cellPadding;
        this.randomOffset = Math.min(randomOffset, cellPadding);
        this.containerWidth = graph.container.clientWidth;
        this.containerHeight = graph.container.clientHeight;
        this.graphZoom = graph.zoom();
        this.graphWidth = this.containerWidth / this.graphZoom;
        this.graphHeight = this.containerHeight / this.graphZoom;
        this.graphOriginX = graph.options.x;
        this.graphOriginY = graph.options.y;
        this.gridCellWidth = this.nodeWidth + 2 * this.cellPadding;
        this.gridCellHeight = this.nodeHeight + 2 * this.cellPadding;
        this.gridColCount = Math.floor(this.graphWidth / this.gridCellWidth);
        this.gridRowCount = Math.floor(this.graphHeight / this.gridCellHeight);
        this.gridCellCount = this.gridRowCount * this.gridColCount;
    }

    layout(targetNodes: Node<Node.Properties>[], animated: boolean): Observable<[void[], void[]]> {
        const nodeGridCellOccupation: Array<[Node<Node.Properties>, number]> = [];
        const allNodes = this.graph.getNodes();
        const staticNodes = allNodes.filter((node) => !targetNodes.includes(node));
        let occupiedCellCount = 0;

        if (this.gridCellCount < allNodes.length) {
            const scaleFactor = this.findSmallestScale(allNodes.length);
            this.graph.zoomTo(this.graphZoom / scaleFactor, {center: {x: 0, y: 0}});
            this.graphWidth = this.graphWidth * scaleFactor;
            this.graphHeight = this.graphHeight * scaleFactor;
            this.gridColCount = Math.floor(this.graphWidth / this.gridCellWidth);
            this.gridRowCount = Math.floor(this.graphHeight / this.gridCellHeight);
            this.gridCellCount = this.gridRowCount * this.gridColCount;
        }

        const gridCells: Array<Array<Array<Node<Node.Properties>>>> = this.initArray();

        occupiedCellCount = this.checkStaticNodes(staticNodes, gridCells, nodeGridCellOccupation);
        return forkJoin([
            this.fixStaticNodes(nodeGridCellOccupation, occupiedCellCount, targetNodes.length, animated, gridCells),
            this.fixTargetNodes(targetNodes, animated, gridCells),
        ]);
    }

    layoutAroundCenter(
        centerNode: Node<Node.Properties>,
        targetNodes: Node<Node.Properties>[],
        animated: boolean
    ): Observable<[void[], void[]]> {
        const centerIndex = targetNodes.indexOf(centerNode);
        if (centerIndex != -1) targetNodes.splice(centerIndex, 1);

        const nodeGridCellOccupation: Array<[Node<Node.Properties>, number]> = [];
        const allNodes = this.graph.getNodes();
        const staticNodes = allNodes.filter((node) => !targetNodes.includes(node));
        let occupiedCellCount = 0;

        if (this.gridCellCount < allNodes.length) {
            const scaleFactor = this.findSmallestScale(allNodes.length);
            this.graph.zoomTo(this.graphZoom / scaleFactor, {center: {x: 0, y: 0}});
            this.graphOriginX = this.graph.options.x;
            this.graphOriginY = this.graph.options.y;
            this.graphWidth = this.graphWidth * scaleFactor;
            this.graphHeight = this.graphHeight * scaleFactor;
            this.gridColCount = Math.floor(this.graphWidth / this.gridCellWidth);
            this.gridRowCount = Math.floor(this.graphHeight / this.gridCellHeight);
            this.gridCellCount = this.gridRowCount * this.gridColCount;
        }

        const gridCells: Array<Array<Array<Node<Node.Properties>>>> = this.initArray();

        occupiedCellCount = this.checkStaticNodes(staticNodes, gridCells, nodeGridCellOccupation);
        return forkJoin([
            this.fixStaticNodes(nodeGridCellOccupation, occupiedCellCount, targetNodes.length, animated, gridCells),
            this.fixTargetNodesAroundCenter(centerNode, targetNodes, animated, gridCells),
        ]);
    }

    private mapPosition(pos: PointLike): PointLike {
        return {
            x: pos.x + this.graphOriginX,
            y: pos.y + this.graphOriginY,
        };
    }

    private unmapPosition(pos: PointLike): PointLike {
        return {
            x: pos.x - this.graphOriginX,
            y: pos.y - this.graphOriginY,
        };
    }

    private findSmallestScale(nodeCount: number): number {
        const gridColCount = this.graphWidth / this.gridCellWidth;
        const grindRowCount = this.graphHeight / this.gridCellHeight;

        let minScale = 0;
        let maxScale = nodeCount / Math.floor(Math.max(gridColCount, grindRowCount));

        while (true) {
            const scale = (minScale + maxScale) / 2;
            const emptyGridCellsCount =
                Math.floor(scale * grindRowCount) * Math.floor(scale * gridColCount) - nodeCount;

            if (emptyGridCellsCount > 0) {
                if (scale - minScale <= 0.05) {
                    return scale;
                }
                maxScale = scale;
            } else if (emptyGridCellsCount < 0) {
                minScale = scale;
            } else {
                return scale;
            }
        }
    }

    private fixStaticNodes(
        nodeGridCellOccupation: Array<[Node<Node.Properties>, number]>,
        occupiedCellCount: number,
        targetNodesCount: number,
        animated: boolean,
        gridCells: Array<Array<Array<Node<Node.Properties>>>>
    ): Observable<void[]> {
        nodeGridCellOccupation.sort((n) => n[1]);

        const dummyObservable = new ReplaySubject<void>();
        dummyObservable.next();
        dummyObservable.complete();
        const transitionFinished: Observable<void>[] = [dummyObservable];

        while (this.gridCellCount - occupiedCellCount < targetNodesCount) {
            const nodeCell = nodeGridCellOccupation.shift();
            if (!nodeCell) break;

            const node = nodeCell[0];

            const {topLeft, topRight, bottomLeft, bottomRight} = this.calcCorners(node);

            const cellTopLeft = this.calcGridCell(topLeft);
            const cellTopRight = this.calcGridCell(topRight);
            const cellBottomLeft = this.calcGridCell(bottomLeft);
            const cellBottomRight = this.calcGridCell(bottomRight);

            const cellTopLeftPos = this.calcNodePosInCell(cellTopLeft);
            const cellTopRightPos = this.calcNodePosInCell(cellTopRight);
            const cellBottomLeftPos = this.calcNodePosInCell(cellBottomLeft);
            const cellBottomRightPos = this.calcNodePosInCell(cellBottomRight);

            const dist2TopLeft = this.dist2(topLeft.x, topLeft.y, cellTopLeftPos.x, cellTopLeftPos.y);
            const dist2TopRight = this.dist2(topLeft.x, topLeft.y, cellTopRightPos.x, cellTopRightPos.y);
            const dist2BottomLeft = this.dist2(topLeft.x, topLeft.y, cellBottomLeftPos.x, cellBottomLeftPos.y);
            const dist2BottomRight = this.dist2(topLeft.x, topLeft.y, cellBottomRightPos.x, cellBottomRightPos.y);

            const minDist2 = Math.min(dist2TopLeft, dist2TopRight, dist2BottomLeft, dist2BottomRight);

            if (minDist2 == dist2TopLeft) {
                const pos = this.unmapPosition(this.applyRandomOffset(cellTopLeftPos, this.randomOffset));
                if (animated) transitionFinished.push(this.graphService.animateMove(node, pos.x, pos.y));
                else node.setPosition(pos.x, pos.y);
                if (this.freeCell(gridCells, cellTopRight, node) == 0) occupiedCellCount--;
                if (this.freeCell(gridCells, cellBottomLeft, node) == 0) occupiedCellCount--;
                if (this.freeCell(gridCells, cellBottomRight, node) == 0) occupiedCellCount--;
            } else if (minDist2 == dist2TopRight) {
                const pos = this.unmapPosition(this.applyRandomOffset(cellTopRightPos, this.randomOffset));
                if (animated) transitionFinished.push(this.graphService.animateMove(node, pos.x, pos.y));
                else node.setPosition(pos.x, pos.y);
                if (this.freeCell(gridCells, cellTopLeft, node) == 0) occupiedCellCount--;
                if (this.freeCell(gridCells, cellBottomLeft, node) == 0) occupiedCellCount--;
                if (this.freeCell(gridCells, cellBottomRight, node) == 0) occupiedCellCount--;
            } else if (minDist2 == dist2BottomLeft) {
                const pos = this.unmapPosition(this.applyRandomOffset(cellBottomLeftPos, this.randomOffset));
                if (animated) transitionFinished.push(this.graphService.animateMove(node, pos.x, pos.y));
                else node.setPosition(pos.x, pos.y);
                if (this.freeCell(gridCells, cellTopLeft, node) == 0) occupiedCellCount--;
                if (this.freeCell(gridCells, cellTopRight, node) == 0) occupiedCellCount--;
                if (this.freeCell(gridCells, cellBottomRight, node) == 0) occupiedCellCount--;
            } else {
                const pos = this.unmapPosition(this.applyRandomOffset(cellBottomRightPos, this.randomOffset));
                if (animated) transitionFinished.push(this.graphService.animateMove(node, pos.x, pos.y));
                else node.setPosition(pos.x, pos.y);
                if (this.freeCell(gridCells, cellTopLeft, node) == 0) occupiedCellCount--;
                if (this.freeCell(gridCells, cellTopRight, node) == 0) occupiedCellCount--;
                if (this.freeCell(gridCells, cellBottomLeft, node) == 0) occupiedCellCount--;
            }
        }

        return forkJoin(transitionFinished);
    }

    private calcCorners(node: Node<Node.Properties>): {
        topLeft: PointLike;
        topRight: PointLike;
        bottomLeft: PointLike;
        bottomRight: PointLike;
    } {
        const pos = this.mapPosition(node.getPosition());
        const nodeSize = node.size();
        return {
            topLeft: {
                x: pos.x,
                y: pos.y,
            },
            topRight: {
                x: pos.x + nodeSize.width,
                y: pos.y,
            },
            bottomLeft: {
                x: pos.x,
                y: pos.y + nodeSize.height,
            },
            bottomRight: {
                x: pos.x + nodeSize.width,
                y: pos.y + nodeSize.height,
            },
        };
    }

    private calcGridCell(pos: PointLike): RowCol {
        return {
            col: this.clampCol(pos.x / this.gridCellWidth),
            row: this.clampRow(pos.y / this.gridCellHeight),
        };
    }

    private calcNodePosInCell(cell: RowCol): PointLike {
        return {
            x: cell.col * this.gridCellWidth + this.cellPadding,
            y: cell.row * this.gridCellHeight + this.cellPadding,
        };
    }

    private freeCell(
        gridCells: Array<Array<Array<Node<Node.Properties>>>>,
        cell: RowCol,
        node: Node<Node.Properties>
    ): number {
        gridCells[cell.row][cell.col].splice(gridCells[cell.row][cell.col].indexOf(node), 1);
        return gridCells[cell.row][cell.col].length;
    }

    private fixTargetNodes(
        targetNodes: Node<Node.Properties>[],
        animated: boolean,
        gridCells: Array<Array<Array<Node<Node.Properties>>>>
    ): Observable<void[]> {
        let targetNodeIndex = 0;
        let nodeExist = true;
        const dummyObservable = new ReplaySubject<void>();
        dummyObservable.next();
        dummyObservable.complete();
        const transitionFinished: Observable<void>[] = [dummyObservable];
        for (let row = 0; row < this.gridRowCount; row++) {
            for (let col = 0; col < this.gridColCount; col++) {
                if (gridCells[row][col].length == 0) {
                    const posInCell = this.calcNodePosInCell({row: row, col: col});
                    const finalPos = this.unmapPosition(this.applyRandomOffset(posInCell, this.randomOffset));

                    if (targetNodeIndex == targetNodes.length) {
                        nodeExist = false;
                        break;
                    }

                    if (animated)
                        transitionFinished.push(
                            this.graphService.animateMove(targetNodes[targetNodeIndex++], finalPos.x, finalPos.y)
                        );
                    else targetNodes[targetNodeIndex++].setPosition(finalPos.x, finalPos.y);
                }
            }
            if (!nodeExist) break;
        }
        return forkJoin(transitionFinished);
    }

    private fixTargetNodesAroundCenter(
        centerNode: Node<Node.Properties>,
        targetNodes: Node<Node.Properties>[],
        animated: boolean,
        gridCells: Array<Array<Array<Node<Node.Properties>>>>
    ): Observable<void[]> {
        let targetNodeIndex = 0;
        let nodeExist = true;
        const dummyObservable = new ReplaySubject<void>();
        dummyObservable.next();
        dummyObservable.complete();
        const transitionFinished: Observable<void>[] = [dummyObservable];

        const topLeft = this.mapPosition(centerNode.getPosition());
        const cellTopLeft = this.calcGridCell(topLeft);
        let radius = 1;
        while (true) {
            const ring = this.calcRing(cellTopLeft, this.gridRowCount, this.gridColCount, radius);
            if (ring.length == 0) break;

            for (let i = 0; i < ring.length; i++) {
                if (gridCells[ring[i].row][ring[i].col].length == 0) {
                    const posInCell = this.calcNodePosInCell(ring[i]);
                    const finalPos = this.unmapPosition(this.applyRandomOffset(posInCell, this.randomOffset));

                    if (targetNodeIndex == targetNodes.length) {
                        nodeExist = false;
                        break;
                    }

                    if (animated)
                        transitionFinished.push(
                            this.graphService.animateMove(targetNodes[targetNodeIndex++], finalPos.x, finalPos.y)
                        );
                    else targetNodes[targetNodeIndex++].setPosition(finalPos.x, finalPos.y);
                }
            }

            if (!nodeExist) break;
            radius++;
        }

        return forkJoin(transitionFinished);
    }

    private calcRing(rowCol: RowCol, rowCount: number, colCount: number, radius: number): RowCol[] {
        const ring: RowCol[] = [];
        const topLeft = {
            row: rowCol.row - radius,
            col: rowCol.col - radius,
        };
        const topRight = {
            row: rowCol.row - radius,
            col: rowCol.col + radius,
        };
        const bottomLeft = {
            row: rowCol.row + radius,
            col: rowCol.col - radius,
        };
        const bottomRight = {
            row: rowCol.row + radius,
            col: rowCol.col + radius,
        };

        for (let i = 1; i <= radius * 2 - 1; i++) {
            const newRowCol = {
                row: topLeft.row,
                col: topLeft.col + i,
            };
            if (this.validRowCol(newRowCol, rowCount, colCount)) ring.push(newRowCol);
        }
        for (let i = 1; i <= radius * 2 - 1; i++) {
            const newRowCol = {
                row: topLeft.row + i,
                col: topLeft.col,
            };
            if (this.validRowCol(newRowCol, rowCount, colCount)) ring.push(newRowCol);
        }
        for (let i = 1; i <= radius * 2 - 1; i++) {
            const newRowCol = {
                row: topRight.row + i,
                col: topRight.col,
            };
            if (this.validRowCol(newRowCol, rowCount, colCount)) ring.push(newRowCol);
        }
        for (let i = 1; i <= radius * 2 - 1; i++) {
            const newRowCol = {
                row: bottomLeft.row,
                col: bottomLeft.col + i,
            };
            if (this.validRowCol(newRowCol, rowCount, colCount)) ring.push(newRowCol);
        }

        if (this.validRowCol(topLeft, rowCount, colCount)) ring.push(topLeft);
        if (this.validRowCol(topRight, rowCount, colCount)) ring.push(topRight);
        if (this.validRowCol(bottomLeft, rowCount, colCount)) ring.push(bottomLeft);
        if (this.validRowCol(bottomRight, rowCount, colCount)) ring.push(bottomRight);

        ring.sort(() => Math.random() - 0.5);
        return ring;
    }

    private validRowCol(rowCol: RowCol, rowCount: number, colCount: number): boolean {
        if (rowCol.col >= colCount) return false;
        if (rowCol.row >= rowCount) return false;
        if (rowCol.col < 0) return false;
        if (rowCol.row < 0) return false;
        return true;
    }

    private checkStaticNodes(
        staticNodes: Node<Node.Properties>[],
        gridCells: Array<Array<Array<Node<Node.Properties>>>>,
        nodeGridCellOccupation: Array<[Node<Node.Properties>, number]>
    ): number {
        let occupiedCellCount = 0;
        for (let node of staticNodes) {
            const {topLeft, topRight, bottomLeft, bottomRight} = this.calcCorners(node);

            const cellTopLeft = this.calcGridCell(topLeft);
            const cellTopRight = this.calcGridCell(topRight);
            const cellBottomLeft = this.calcGridCell(bottomLeft);
            const cellBottomRight = this.calcGridCell(bottomRight);

            const uniqueCells: RowCol[] = this.calcUniqueCells([
                cellTopLeft,
                cellTopRight,
                cellBottomLeft,
                cellBottomRight,
            ]);

            nodeGridCellOccupation.push([node, uniqueCells.length]);
            uniqueCells.forEach((uc) => {
                if (gridCells[uc.row][uc.col].length == 0) occupiedCellCount++;
                gridCells[uc.row][uc.col].push(node);
            });
        }
        return occupiedCellCount;
    }

    private calcUniqueCells(cells: RowCol[]): RowCol[] {
        const uniqueCells: RowCol[] = [];
        for (let cell of cells) {
            if (!uniqueCells.find((c) => cell.col == c.col && cell.row == c.row)) {
                uniqueCells.push(cell);
            }
        }
        return uniqueCells;
    }

    private clampRow(row: number): number {
        return this.clamp(Math.floor(row), 0, this.gridRowCount - 1);
    }

    private clampCol(col: number): number {
        return this.clamp(Math.floor(col), 0, this.gridColCount - 1);
    }

    private initArray(): Node<Node.Properties>[][][] {
        const gridCells: Array<Array<Array<Node<Node.Properties>>>> = Array(this.gridRowCount);
        for (let i = 0; i < this.gridRowCount; i++) {
            gridCells[i] = Array(this.gridColCount);

            for (let j = 0; j < this.gridColCount; j++) {
                gridCells[i][j] = [];
            }
        }
        return gridCells;
    }

    private dist2(x1: number, y1: number, x2: number, y2: number): number {
        return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
    }

    private clamp(n: number, minValue: number, maxValue: number): number {
        return Math.max(minValue, Math.min(maxValue, n));
    }

    private applyRandomOffset(pos: PointLike, randomOffset: number): PointLike {
        const x = pos.x + Math.floor(Math.random() * (randomOffset * 2 + 1)) - randomOffset;
        const y = pos.y + Math.floor(Math.random() * (randomOffset * 2 + 1)) - randomOffset;
        return {x, y};
    }
}

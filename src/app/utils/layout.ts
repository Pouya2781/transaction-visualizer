import {Graph, Node, PointLike} from '@antv/x6';
import {forkJoin, Observable, ReplaySubject} from 'rxjs';
import {GraphService} from '../services/graph.service';
import {RowCol} from '../models/row-col.type';

interface GraphData {
    containerWidth: number;
    containerHeight: number;
    zoom: number;
    width: number;
    height: number;
    originX: number;
    originY: number;
}

interface GridData {
    cellWidth: number;
    cellHeight: number;
    rowCount: number;
    colCount: number;
    cellCount: number;
}

export class Layout {
    private graphData: GraphData;
    private gridData: GridData;

    public constructor(
        private readonly graph: Graph,
        private readonly graphService: GraphService,
        private readonly nodeWidth: number,
        private readonly nodeHeight: number,
        private readonly cellPadding: number,
        private readonly randomOffset: number = 0
    ) {
        this.graphData = {
            containerWidth: graph.container.clientWidth,
            containerHeight: graph.container.clientHeight,
            zoom: graph.zoom(),
            width: graph.container.clientWidth / graph.zoom(),
            height: graph.container.clientHeight / graph.zoom(),
            originX: graph.options.x,
            originY: graph.options.y,
        };

        this.gridData = {
            cellWidth: this.nodeWidth + 2 * this.cellPadding;
            cellHeight: this.nodeHeight + 2 * this.cellPadding;
            colCount: Math.floor(this.graphData.width / this.gridData.cellWidth);
            rowCount: Math.floor(this.graphData.height / this.gridData.cellHeight);
            cellCount: this.gridData.rowCount * this.gridData.colCount;
        }

        this.randomOffset = Math.min(randomOffset, cellPadding);
    }

    public layout(targetNodes: Node<Node.Properties>[], animated: boolean): Observable<[void[], void[]]> {
        const nodeGridCellOccupation: Array<[Node<Node.Properties>, number]> = [];
        const allNodes = this.graph.getNodes();
        const staticNodes = allNodes.filter((node) => !targetNodes.includes(node));
        let occupiedCellCount = 0;

        if (this.gridData.cellCount < allNodes.length) {
            const scaleFactor = this.findSmallestScale(allNodes.length);
            this.graph.zoomTo(this.graphData.zoom / scaleFactor, {center: {x: 0, y: 0}});
            this.graphData.width = this.graphData.width * scaleFactor;
            this.graphData.height = this.graphData.height * scaleFactor;
            this.gridData.colCount = Math.floor(this.graphData.width / this.gridData.cellWidth);
            this.gridData.rowCount = Math.floor(this.graphData.height / this.gridData.cellHeight);
            this.gridData.cellCount = this.gridData.rowCount * this.gridData.colCount;
        }

        const gridCells: Array<Array<Array<Node<Node.Properties>>>> = this.initArray();

        occupiedCellCount = this.checkStaticNodes(staticNodes, gridCells, nodeGridCellOccupation);
        return forkJoin([
            this.fixStaticNodes(nodeGridCellOccupation, occupiedCellCount, targetNodes.length, animated, gridCells),
            this.fixTargetNodes(targetNodes, animated, gridCells),
        ]);
    }

    public layoutAroundCenter(
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

        if (this.gridData.cellCount < allNodes.length) {
            const scaleFactor = this.findSmallestScale(allNodes.length);
            this.graph.zoomTo(this.graphData.zoom / scaleFactor, {center: {x: 0, y: 0}});
            this.graphData.originX = this.graph.options.x;
            this.graphData.originY = this.graph.options.y;
            this.graphData.width = this.graphData.width * scaleFactor;
            this.graphData.height = this.graphData.height * scaleFactor;
            this.gridData.colCount = Math.floor(this.graphData.width / this.gridData.cellWidth);
            this.gridData.rowCount = Math.floor(this.graphData.height / this.gridData.cellHeight);
            this.gridData.cellCount = this.gridData.rowCount * this.gridData.colCount;
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
            x: pos.x + this.graphData.originX,
            y: pos.y + this.graphData.originY,
        };
    }

    private unmapPosition(pos: PointLike): PointLike {
        return {
            x: pos.x - this.graphData.originX,
            y: pos.y - this.graphData.originY,
        };
    }

    private findSmallestScale(nodeCount: number): number {
        const gridColCount = this.graphData.width / this.gridData.cellWidth;
        const grindRowCount = this.graphData.height / this.gridData.cellHeight;

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

        while (this.gridData.cellCount - occupiedCellCount < targetNodesCount) {
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
            col: this.clampCol(pos.x / this.gridData.cellWidth),
            row: this.clampRow(pos.y / this.gridData.cellHeight),
        };
    }

    private calcNodePosInCell(cell: RowCol): PointLike {
        return {
            x: cell.col * this.gridData.cellWidth + this.cellPadding,
            y: cell.row * this.gridData.cellHeight + this.cellPadding,
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
        for (let row = 0; row < this.gridData.rowCount; row++) {
            for (let col = 0; col < this.gridData.colCount; col++) {
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
            const ring = this.calcRing(cellTopLeft, this.gridData.rowCount, this.gridData.colCount, radius);
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
        return this.clamp(Math.floor(row), 0, this.gridData.rowCount - 1);
    }

    private clampCol(col: number): number {
        return this.clamp(Math.floor(col), 0, this.gridData.colCount - 1);
    }

    private initArray(): Node<Node.Properties>[][][] {
        const gridCells: Array<Array<Array<Node<Node.Properties>>>> = Array(this.gridData.rowCount);
        for (let i = 0; i < this.gridData.rowCount; i++) {
            gridCells[i] = Array(this.gridData.colCount);

            for (let j = 0; j < this.gridData.colCount; j++) {
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

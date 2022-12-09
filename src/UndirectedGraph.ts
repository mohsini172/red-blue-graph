import { Data, Network } from 'vis-network';

class UnpaintableError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "UnpaintableError";
    }
}

interface ColorNode {
    value: string;
    color?: string;
    connectedNodes: string[]
}


export class UndirectedGraph {
    private adjacencyList: { [key: string]: ColorNode } = {};
    addEdge(from: string, to: string) {
        if (!this.adjacencyList[from]) {
            this.adjacencyList[from] = {
                value: from,
                connectedNodes: []
            };
        }
        if (!this.adjacencyList[from].connectedNodes.includes(to)) {
            this.adjacencyList[from].connectedNodes.push(to);
        }
        if (!this.adjacencyList[to]) {
            this.adjacencyList[to] = {
                value: to,
                connectedNodes: []
            };
        }
        if (!this.adjacencyList[to].connectedNodes.includes(from)) {
            this.adjacencyList[to].connectedNodes.push(from);
        }
    }

    private paint(itr: ColorNode, painted: string[], previous?: ColorNode,) {
        console.log('Visiting: ', itr.value)
        if (painted.includes(itr.value)) {
            return
        }


        let color = 'red';
        if (!!previous?.color) {
            color = previous.color === 'red' ? 'blue' : 'red';
        }
        itr.color = color;
        painted.push(itr.value)
        for (const key of itr.connectedNodes) {
            const connectedNode = this.adjacencyList[key];
            if (!connectedNode.color) {
                this.paint(connectedNode, painted, itr)
            }
            if (connectedNode.color === itr.color) {
                throw new UnpaintableError(`Two adjacent nodes have same color: '${itr.value}' is ${itr.color}' and '${connectedNode.value}' is also ${connectedNode.color}`)
            }
        }
    }

    isGraphRedBlueColorable(): [boolean, string] {
        const allVertices = Object.entries(this.adjacencyList);
        if (!allVertices.length) {
            return [true, ''];
        }
        try {
            const visited: string[] = [];
            this.paint(Object.values(this.adjacencyList)[0], visited)
            if (visited.length != allVertices.length) {
                return [false, 'Graph is not complete.'];
            }
            return [true, 'Yes, graph is red blue colorable.'];
        } catch (error) {
            if (error instanceof UnpaintableError) {
                return [false, error.message];
            }
            throw error;
        }
    }
    getNodes() {
        return Object
            .values(
                this.adjacencyList
            ).map(
                node => ({
                    id: node.value,
                    label: node.value,
                    color: node.color === 'red' ? '#e06c78' : '#42A5F5'
                })
            )
    }

    // This function will return unique edges between two nodes
    getEdges() {
        const added: { [key: string]: ColorNode } = {};
        const edges: { from: string, to: string }[] = []
        Object.values(this.adjacencyList).forEach(node => {
            const from = node.value;
            if (!added[from]) {
                added[from] = {
                    value: from,
                    connectedNodes: []
                }
            }
            for (const connectedNode of node.connectedNodes) {
                if (!added[connectedNode]) {
                    added[connectedNode] = {
                        value: connectedNode,
                        connectedNodes: []
                    }
                }
                if (!added[from].connectedNodes.includes(connectedNode) && !added[connectedNode].connectedNodes.includes(from)) {
                    added[from].connectedNodes.push(connectedNode)
                    added[connectedNode].connectedNodes.push(from)
                    edges.push({ from, to: connectedNode })
                }
            }
        });
        return edges
    }
    draw(divId: string) {
        const nodes = this.getNodes().map(node => ({ ...node, borderWidth: 0, font: {color: 'lightgrey'}}));
        const edges = this.getEdges().map(edge => ({ ...edge, color: 'lightgrey'}));
        // create a network
        const container = <HTMLElement>document.getElementById(divId);
        const data: Data = {
            nodes: nodes,
            edges: edges,
        };
        const options = {
            nodes: {
                shape: "dot",
                size: 24,
            },
            physics: {
                forceAtlas2Based: {
                    gravitationalConstant: -26,
                    centralGravity: 0.005,
                    springLength: 230,
                    springConstant: 0.18,
                },
                maxVelocity: 146,
                solver: "forceAtlas2Based",
                timestep: 0.35,
                stabilization: { iterations: 150 },
            },
        };
        new Network(container, data, options);
    }
}
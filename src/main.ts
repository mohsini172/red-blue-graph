import './style.css'
import { UndirectedGraph } from './UndirectedGraph';

const input = <HTMLInputElement | undefined>document.getElementById("input");
const button = document.getElementById('check-btn');
const alert = document.getElementById('alert');
const alertMessage = document.getElementById('alertMessage');
const successImg = document.getElementById('successImg');
const errorImg = document.getElementById('errorImg');
const pattern = /^\w+(\-\w+)+$/

function showAlert(isSuccess: boolean, message: string) {
    if (!alert || !alertMessage || !successImg || !errorImg) return
    alert.style.display = 'flex'
    if (isSuccess) {
        successImg.style.display = 'block';
        errorImg.style.display = 'none'
    } else {
        errorImg.style.display = 'block'
        successImg.style.display = 'none';
    }
    alertMessage.innerHTML = `${message}`;
    setTimeout(() => {
        alert.style.display = 'none';
    }, 3000);
}

function onClick() {
    const value = input?.value;
    if (!value) {
        showAlert(false, "Invalid input")
        return;
    }
    const undirectedGraph = new UndirectedGraph();
    // parsing all the paths based of ',' or new line
    const paths = value.replace(/\s/g, '').split(/,|\n/)
    for (const path of paths) {
        if (!pattern.test(path)) {
            showAlert(false, "Invalid pattern")
            return
        }
        const vertices = path.split("-");
        for (let i = 0; i < vertices.length - 1; i++) {
            undirectedGraph.addEdge(vertices[i], vertices[i + 1])
        }
    }
    const [isRedBlueColorable, message] = undirectedGraph.isGraphRedBlueColorable();
    undirectedGraph.draw("graph")
    showAlert(isRedBlueColorable, message);
}




button?.addEventListener('click', onClick)
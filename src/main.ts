import { App } from './app'

const canvas = document.getElementById('aquarium') as HTMLCanvasElement
const overlay = document.getElementById('overlay') as HTMLElement

const app = new App(canvas, overlay)
app.start()

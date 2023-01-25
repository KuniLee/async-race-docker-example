import { CarInterface, WorkingCar } from 'types/interfaces'
import carTemplate from '@/templates/carTemplate.hbs'

export type CarInstance = typeof Car

export default class Car {
  public name: string
  public color: string
  public id: number
  private deleteBtn: HTMLButtonElement
  public carElement: HTMLDivElement
  private selectBtn: HTMLButtonElement
  public startBtn: HTMLButtonElement
  private stopBtn: HTMLButtonElement
  private animationID: number | null = null
  private carCase: SVGAElement

  constructor(car: CarInterface) {
    this.name = car.name
    this.color = car.color
    this.id = car.id
    this.carElement = this.renderCarContainer()
    this.carCase = this.carElement.querySelector('.carCase') as SVGAElement
    this.deleteBtn = this.carElement.querySelector('[data-btn = "delete"]') as HTMLButtonElement
    this.selectBtn = this.carElement.querySelector('[data-btn = "select"]') as HTMLButtonElement
    this.startBtn = this.carElement.querySelector('[data-btn = "start"]') as HTMLButtonElement
    this.stopBtn = this.carElement.querySelector('[data-btn = "stop"]') as HTMLButtonElement
  }

  public onDelete(callback: () => void) {
    this.deleteBtn.onclick = callback
  }

  public onSelect(callback: () => void) {
    this.selectBtn.onclick = callback
  }

  public onStart(callback: () => void) {
    this.startBtn.onclick = () => {
      this.startBtn.disabled = true
      callback()
    }
  }

  public onStop(callback: () => void) {
    this.stopBtn.onclick = () => {
      callback()
    }
  }

  private renderCarContainer() {
    const container = document.createElement('div')
    container.className = 'car'
    container.innerHTML = carTemplate({ color: this.color, name: this.name })
    return container
  }

  select() {
    this.selectBtn.classList.remove('btn-secondary')
    this.selectBtn.classList.add('btn-success')
  }

  animate(animationData: WorkingCar) {
    this.startBtn.disabled = true
    this.stopBtn.disabled = false
    const { startTime, velocity, distance } = animationData
    const carSVG = this.carElement.querySelector('.distance > svg') as SVGAElement
    const tick = (time: number) => {
      const pastTime = time - (startTime || 0)
      const passedDistance = pastTime < 0 ? 0 : velocity * pastTime
      const offset = ((animationData.breakDistance || passedDistance) / distance) * 100
      carSVG.style.left = `${offset > 100 ? 100 : offset}%`
      if (animationData.breakDistance) {
        this.stopBrokenCar()
        return
      } else if (passedDistance < distance) this.animationID = requestAnimationFrame(tick)
      else carSVG.style.left = `100%`
    }
    tick(performance.now())
  }

  resetCar() {
    if (this.animationID) cancelAnimationFrame(this.animationID)
    const carSVG = this.carElement.querySelector('.distance > svg') as SVGAElement
    carSVG.style.left = ``
    this.stopBtn.disabled = true
    this.carCase.classList.remove('broken')
  }

  stopBrokenCar() {
    if (this.animationID) cancelAnimationFrame(this.animationID)
    this.carCase.classList.add('broken')
  }
}

import EventEmitter from 'events'
import { AppModelInstance } from '@/components/models/model'
import garageTemplate from '@/templates/garageTemplate.hbs'
import winTemplate from '@/templates/winMessage.hbs'
import { Views } from 'types/enums'
import Car from '@/utils/Car'
import { CarInterface, InputState, WinMessages } from 'types/interfaces'
import { CARS_ON_PAGE } from 'types/constants'

type GarageViewEventsName =
  | 'VIEW_CLICK'
  | 'NEXT_PAGE'
  | 'PREV_PAGE'
  | 'CREATE_CAR'
  | 'UPDATE_CAR'
  | 'GENERATE'
  | 'DELETE'
  | 'START_CAR'
  | 'STOP_CAR'
  | 'RESET'
  | 'RACE'

export type GarageViewInstance = InstanceType<typeof GarageView>

export class GarageView extends EventEmitter {
  private winMessages: WinMessages = {}
  public startingCars: Set<number> = new Set()
  public runningCars: Set<number> = new Set()
  private mainContainer: HTMLElement | undefined
  private nextBtn: HTMLButtonElement | undefined
  private prevBtn: HTMLButtonElement | undefined
  public generateBtn: HTMLButtonElement | undefined
  private createForm: HTMLFormElement | undefined
  private updateForm: HTMLFormElement | undefined
  private updateBtn: HTMLButtonElement | undefined
  public resetBtn: HTMLButtonElement | undefined
  public raceBtn: HTMLButtonElement | undefined
  private formInputs: InputState = {
    create: { name: '', color: '#000000' },
    update: { name: '', color: '#000000', id: null },
  }
  public carsInstances: Car[] = []

  constructor(private model: Readonly<AppModelInstance>) {
    super()
    this.model.on('GARAGE_UPDATED', () => {
      if (this.model.state.view === Views.Garage) this.renderTable()
    })
  }

  emit<T>(event: GarageViewEventsName, data?: T) {
    return super.emit(event, data)
  }

  on<T>(event: GarageViewEventsName, callback: (data: T) => void) {
    return super.on(event, callback)
  }

  private renderTable() {
    const { garage, garagePage, garageCount } = this.model.state
    const pageElement = this.mainContainer?.querySelector('#pageNumber') as HTMLSpanElement
    const amountElement = this.mainContainer?.querySelector('#amount') as HTMLSpanElement
    const garageTable = this.mainContainer?.querySelector('#garage') as HTMLDivElement
    const noCarsText = garageTable.querySelector('span') as HTMLSpanElement
    pageElement.textContent = garagePage.toString()
    amountElement.textContent = garageCount.toString()
    garageTable.querySelectorAll('.car').forEach((el) => {
      el.remove()
    })
    noCarsText.hidden = Boolean(garageCount)
    garageTable.append(...this.createCarInstances(garage))
    this.updatePageBtns()
    this.updateRaceBtn()
    this.showWinMessage()
  }

  private createCarInstances(garage: CarInterface[]) {
    this.carsInstances = garage.map((el) => new Car(el))
    this.carsInstances.forEach((car) => {
      car.onDelete(() => {
        if (this.updateForm) this.updateFormValues(this.updateForm)
        this.emit('DELETE', car)
      })
      car.onSelect(this.selectCar.bind(this, { id: car.id, color: car.color, name: car.name }))
      car.onStart(this.emit.bind(this, 'START_CAR', car))
      car.onStop(this.emit.bind(this, 'STOP_CAR', car))
      const animationData = this.model.startedCar.find((el) => el.id === car.id)
      if (animationData) car.animate(animationData)
      if (this.runningCars.has(car.id)) car.startBtn.disabled = true
    })
    this.carsInstances.find((el) => el.id === this.formInputs.update.id)?.select()
    return this.carsInstances.map((car) => car.carElement)
  }

  private selectCar(car: CarInterface) {
    this.formInputs.update = car
    if (this.updateBtn) this.updateBtn.disabled = false
    if (this.updateForm) this.updateFormValues(this.updateForm, { name: car.name, color: car.color })
    this.renderTable()
  }

  startCar(car: CarInterface) {
    const animationData = this.model.startedCar.find((el) => el.id === car.id)
    if (animationData) this.carsInstances.find((el) => el.id === car.id)?.animate(animationData)
  }

  stopCar(car: CarInterface) {
    const carInstance = this.carsInstances.find((el) => el.id === car.id)
    if (carInstance) {
      carInstance.resetCar()
      if (!this.runningCars.has(car.id)) carInstance.startBtn.disabled = false
    }
    this.updateRaceBtn()
  }

  private updatePageBtns() {
    const { garageCount, garagePage } = this.model.state
    if (this.prevBtn) this.prevBtn.disabled = garagePage < 2
    if (this.nextBtn) this.nextBtn.disabled = Math.ceil(garageCount / CARS_ON_PAGE) === garagePage
  }

  private addListeners() {
    this.addFormListeners()
    this.nextBtn?.addEventListener('click', () => {
      this.emit('NEXT_PAGE')
    })
    this.prevBtn?.addEventListener('click', () => {
      this.emit('PREV_PAGE')
    })
    this.generateBtn?.addEventListener('click', () => {
      if (this.generateBtn) this.generateBtn.disabled = true
      this.emit('GENERATE')
    })
    this.resetBtn?.addEventListener('click', () => {
      this.emit('RESET')
    })
    this.raceBtn?.addEventListener('click', () => {
      if (this.raceBtn) this.raceBtn.disabled = true
      this.emit('RACE')
    })
  }

  renderView() {
    this.mainContainer = document.body.querySelector('main') as HTMLElement
    if (this.mainContainer) this.mainContainer.innerHTML = garageTemplate({ ...this.formInputs })
    this.nextBtn = this.mainContainer?.querySelector('#next') as HTMLButtonElement
    this.prevBtn = this.mainContainer?.querySelector('#prev') as HTMLButtonElement
    this.generateBtn = this.mainContainer?.querySelector('#generate') as HTMLButtonElement
    this.createForm = this.mainContainer?.querySelector('#create') as HTMLFormElement
    this.updateForm = this.mainContainer?.querySelector('#update') as HTMLFormElement
    this.resetBtn = this.mainContainer?.querySelector('#reset') as HTMLButtonElement
    this.raceBtn = this.mainContainer?.querySelector('#race') as HTMLButtonElement
    this.updateBtn = this.updateForm?.querySelector('button') as HTMLButtonElement
    this.addListeners()
  }

  private updateFormValues(form: HTMLFormElement, data?: Pick<CarInterface, 'color' | 'name'>) {
    if (form === this.updateForm && !data && this.updateBtn) {
      this.updateBtn.disabled = true
      this.formInputs.update.id = null
    }
    Array.from(form.elements).forEach((el) => {
      if (el instanceof HTMLInputElement) {
        const key = el.name as keyof Omit<CarInterface, 'id'>
        if (form === this.updateForm) el.disabled = Boolean(!data)
        if (el.type === 'text') el.value = data?.name || ''
        if (el.type === 'color') el.value = data?.color || '#000000'
        this.formInputs[form.id as keyof InputState][key] = el.value
      }
    })
  }

  private addFormListeners() {
    if (this.createForm && this.updateForm) {
      const formElements = [...Array.from(this.createForm.elements), ...Array.from(this.updateForm.elements)]
      formElements.forEach((el) => {
        if (el instanceof HTMLInputElement) {
          el.addEventListener('input', () => {
            const formType = el.parentElement?.id as keyof InputState
            const key = el.name as keyof Omit<CarInterface, 'id'>
            this.formInputs[formType][key] = el.value
          })
        }
      })
      this.createForm?.addEventListener('submit', (ev) => {
        ev.preventDefault()
        this.emit<Omit<CarInterface, 'id'>>('CREATE_CAR', { ...this.formInputs.create })
        if (this.createForm) this.updateFormValues(this.createForm)
      })
      this.updateForm?.addEventListener('submit', (ev) => {
        ev.preventDefault()
        if (this.formInputs.update.id) {
          this.emit<CarInterface>('UPDATE_CAR', this.formInputs.update as CarInterface)
          this.formInputs.update.id = null
          if (this.updateForm) this.updateFormValues(this.updateForm)
          if (this.updateBtn) this.updateBtn.disabled = true
        }
      })
    }
  }

  breakCar(car: CarInterface) {
    if (this.model.isCarStarted(car.id)) this.carsInstances.find((el) => el.id === car.id)?.stopBrokenCar()
  }

  showWinMessage() {
    const msgElement = this.mainContainer?.querySelector('.overlay') as HTMLDivElement
    msgElement?.remove()
    if (!this.winMessages[this.model.state.garagePage]) return
    const { winner, time } = this.winMessages[this.model.state.garagePage]
    const garageTable = this.mainContainer?.querySelector('#garage') as HTMLDivElement
    const template = document.createElement('template')
    template.innerHTML = winTemplate({ name: winner.name, time })
    const closeBtn = template.content.querySelector('button') as HTMLButtonElement
    closeBtn.onclick = this.closeWinMsg.bind(this)
    garageTable?.append(template.content)
  }

  setWinner(racePage: number, car: CarInterface, time: number) {
    this.winMessages[racePage] = { winner: car, time }
    this.showWinMessage()
  }

  updateRaceBtn() {
    if (this.raceBtn)
      this.raceBtn.disabled =
        this.model.state.garage.some((el) => this.model.isCarStarted(el.id) || this.runningCars.has(el.id)) ||
        Boolean(this.startingCars.size) ||
        Boolean(this.runningCars.size)
  }

  updateResetBnt() {
    if (this.resetBtn) this.resetBtn.disabled = this.startingCars.size !== 0 || this.runningCars.size !== 0
  }

  removeFromRunning(id: number) {
    this.runningCars.delete(id)
    const car = this.carsInstances.find((el) => el.id === id)
    if (car && !this.model.isCarStarted(id)) car.startBtn.disabled = false
    this.updateRaceBtn()
    this.updateResetBnt()
  }

  private closeWinMsg() {
    const currentPage = this.model.state.garagePage
    if (currentPage in this.winMessages) {
      delete this.winMessages[currentPage]
      this.showWinMessage()
    }
  }
}

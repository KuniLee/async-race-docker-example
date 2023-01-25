import { CarInterface, Sorting, State, WinnerInterface, WorkingCar } from '@/types/interfaces'
import { Resource, Views } from 'types/enums'
import EventEmitter from 'events'
import { changeEngine, createItem, deleteItem, getCars, getWinner, getWinners, updateItem } from '@/utils/API'
import findMissingNumber from '@/utils/findMissingNumder'
import generateCars from '@/utils/generateCars'
import { CARS_ON_PAGE, WINNERS_ON_PAGE } from 'types/constants'

type AppModelEventsName = 'VIEW_CHANGED' | 'WINNERS_UPDATED' | 'GARAGE_UPDATED'
export type AppModelInstance = InstanceType<typeof AppModel>

export class AppModel extends EventEmitter {
  startedCar: Array<WorkingCar> = []
  public state: State = {
    selectedCar: null,
    winnersCount: 0,
    winners: [],
    garage: [],
    garageCount: 0,
    garagePage: 1,
    winnersPage: 1,
    sorting: { column: 'id', type: 'ASC' },
  }

  constructor() {
    super()
  }

  emit(event: AppModelEventsName) {
    return super.emit(event)
  }

  on(event: AppModelEventsName, callback: () => void) {
    return super.on(event, callback)
  }

  async loadCars() {
    return (await getCars()).items
  }

  sortWinners(sorting: Sorting) {
    this.state.sorting = sorting
    this.loadWinners()
  }

  async loadCarPage(page = this.state.garagePage) {
    const { items, count } = await getCars(page === 0 ? 1 : page)
    const maxPage = Math.ceil(count / CARS_ON_PAGE)
    if (count === 0) this.state.garagePage = 0
    else if (page > maxPage) {
      this.loadCarPage(maxPage)
      return
    } else if (page === 0 && count > 0) this.state.garagePage = 1
    else this.state.garagePage = page
    this.state.garage = items
    this.state.garageCount = count
    this.emit('GARAGE_UPDATED')
  }

  async loadWinners(page = this.state.winnersPage) {
    const { column, type } = this.state.sorting
    const { items, count } = await getWinners(page === 0 ? 1 : page, column, type)
    const maxPage = Math.ceil(count / WINNERS_ON_PAGE)
    if (page > maxPage) {
      this.loadWinners(maxPage)
      return
    } else if (page === 0 && count > 0) this.state.winnersPage = 1
    else if (count === 0) this.state.winnersPage = 0
    else this.state.winnersPage = page
    this.state.winners = items
    this.state.winnersCount = count
    this.emit('WINNERS_UPDATED')
  }

  async createCar(car: Omit<CarInterface, 'id'>) {
    const carList = await this.loadCars()
    const id = findMissingNumber(carList.map((car) => car.id))
    await createItem(Resource.Garage, { ...car, id })
    this.loadCarPage()
  }

  changeView(view: Views) {
    this.state.view = view
    this.emit('VIEW_CHANGED')
  }

  async generateCars(number = 100) {
    const carList = await this.loadCars()
    const newCars = generateCars(
      number,
      carList.map((car) => car.id)
    )
    await Promise.all(newCars.map((car) => createItem(Resource.Garage, car)))
    this.loadCarPage()
  }

  async deleteCar(car: CarInterface) {
    this.removeStartedCar(car.id)
    await deleteItem(Resource.Garage, car.id)
    await deleteItem(Resource.Winners, car.id)
    this.loadCarPage()
  }

  async updateCar(car: CarInterface) {
    await updateItem<CarInterface>(Resource.Garage, car)
    this.loadCarPage()
  }

  async startCar(car: CarInterface) {
    try {
      const response = await changeEngine(car, 'started')
      if (response.status === 200) {
        return (await response.json()) as Pick<WorkingCar, 'distance' | 'velocity'>
      }
    } catch (e) {
      console.log(e)
    }
    return false
  }

  async stopCar(car: CarInterface) {
    try {
      const response = await changeEngine(car, 'stopped')
      if (response.status === 200) {
        this.removeStartedCar(car.id)
        return true
      }
    } catch (e) {
      console.log(e)
    }
  }

  async driveCar(car: CarInterface) {
    try {
      const response = await changeEngine(car, 'drive')
      if (response.status === 200) return true
      if (response.status === 500) {
        this.setBreakDistance(car)
      }
    } catch (e) {
      console.log(e)
    }
  }

  removeStartedCar(id: number) {
    this.startedCar = this.startedCar.filter((car) => car.id !== id)
  }

  isCarStarted(id: number) {
    return this.startedCar.some((el) => el.id === id)
  }

  async createWinner({ id }: CarInterface, time: number) {
    const winner = await getWinner(id)
    if (winner?.id === id) {
      await updateItem<WinnerInterface>(Resource.Winners, {
        id,
        time: time > winner.time ? time : winner.time,
        wins: winner.wins + 1,
      })
    } else {
      await createItem(Resource.Winners, { id, time, wins: 1 })
    }
    this.loadWinners()
  }

  setStartTime(car: CarInterface, time?: number) {
    const startedCar = this.startedCar.find((el) => el.id === car.id)
    if (startedCar) startedCar.startTime = time || performance.now()
  }

  setBreakDistance(car: CarInterface) {
    const brokenCar = this.startedCar.find((el) => el.id === car.id)
    if (brokenCar && brokenCar.startTime)
      brokenCar.breakDistance = brokenCar.velocity * (performance.now() - brokenCar.startTime)
  }
}

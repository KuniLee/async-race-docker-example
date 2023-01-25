import type { AppModelInstance } from '../models/model'
import { Views } from 'types/enums'
import { GarageViewInstance } from '@/components/views/GarageView'
import { CarInterface } from 'types/interfaces'
import Car from '@/utils/Car'

export default class GarageController {
  constructor(private model: AppModelInstance, private view: GarageViewInstance) {
    this.model.on('VIEW_CHANGED', async () => {
      if (this.model.state.view === Views.Garage) {
        await this.view.renderView()
        await this.model.loadCarPage()
      }
    })
    this.view.on('GENERATE', async () => {
      try {
        await this.model.generateCars()
      } catch (err) {
        console.error(err)
      }
      if (this.view.generateBtn) this.view.generateBtn.disabled = false
    })
    this.view.on('NEXT_PAGE', async () => {
      this.model.loadCarPage(this.model.state.garagePage + 1)
    })
    this.view.on('PREV_PAGE', async () => {
      this.model.loadCarPage(this.model.state.garagePage - 1)
    })
    this.view.on('CREATE_CAR', async (car: Omit<CarInterface, 'id'>) => {
      this.model.createCar(car)
    })
    this.view.on('UPDATE_CAR', async (car: CarInterface) => {
      this.model.updateCar(car)
    })
    this.view.on('DELETE', async (car: CarInterface) => {
      this.model.deleteCar(car)
    })
    this.view.on('START_CAR', async (car: CarInterface) => {
      if (this.view.raceBtn) this.view.raceBtn.disabled = true
      if (this.view.resetBtn) this.view.resetBtn.disabled = true
      if (await this.launchCar(car)) {
        this.model.setStartTime(car)
        this.view.startCar(car)
        try {
          if (!(await this.driveCar(car))) this.view.breakCar(car)
        } catch (er) {
          console.log(Car.name, er)
        }
      }
    })
    this.view.on('STOP_CAR', async (car: CarInterface) => {
      if (this.model.isCarStarted(car.id)) {
        await this.model.stopCar(car)
        this.view.stopCar(car)
      }
    })
    this.view.on('RESET', async () => {
      if (this.view.resetBtn) this.view.resetBtn.disabled = true
      await Promise.all(
        this.model.startedCar.map((car) =>
          this.model.stopCar(car).then(() => {
            this.view.stopCar(car)
            return Promise.resolve()
          })
        )
      )
      if (this.view.resetBtn) this.view.resetBtn.disabled = false
    })
    this.view.on('RACE', this.goRace.bind(this))
  }

  private async goRace() {
    const raceCars = this.model.state.garage
    const racePage = this.model.state.garagePage
    try {
      this.view.carsInstances.forEach((el) => (el.startBtn.disabled = true))
      await Promise.all(raceCars.map((car) => this.launchCar(car)))
    } catch (e) {
      console.log(e)
    }
    const startRaceTime = performance.now()
    const result = await Promise.any(
      raceCars.map((car) => {
        this.model.setStartTime(car, startRaceTime)
        this.view.startCar(car)
        return this.driveCar(car)
      })
    )
    // @ts-ignore
    if (result && this.model.isCarStarted(result[0].id)) {
      const winner = result[0] as CarInterface
      const bestTime = result[1] as number
      this.model.createWinner(winner, bestTime)
      this.view.setWinner(racePage, winner, bestTime)
    }
  }

  private async launchCar(car: CarInterface) {
    this.view.startingCars.add(car.id)
    if (this.model.isCarStarted(car.id)) return
    const data = await this.model.startCar(car)
    this.view.runningCars.add(car.id)
    this.view.startingCars.delete(car.id)
    this.view.updateResetBnt()
    if (data) {
      this.model.startedCar.push({ ...data, ...car, startTime: null })
      return true
    }
  }

  private async driveCar(car: CarInterface) {
    if (!this.model.isCarStarted(car.id)) return
    const result = await this.model.driveCar(car)
    this.view.removeFromRunning(car.id)
    if (result) return Promise.resolve([car, this.getCarTime(car.id)])
    return Promise.reject('broken')
  }

  private getCarTime(id: number) {
    const animationData = this.model.startedCar.find((el) => el.id === id)
    if (animationData) return +(animationData.distance / (animationData.velocity * 1000)).toFixed(2)
    return 0
  }
}

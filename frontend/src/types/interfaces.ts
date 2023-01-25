import { Views } from 'types/enums'

export interface State {
  cars?: unknown
  winners: Array<WinnerInterface>
  garage: Array<CarInterface>
  view?: Views
  selectedCar: number | null
  garagePage: number
  garageCount: number
  winnersPage: number
  winnersCount: number
  sorting: Sorting
}

export type Sorting = { column: 'wins' | 'id' | 'time'; type: 'ASC' | 'DESC' }

export type WinnerInterface = {
  id: number
  time: number
  wins: number
}

export type CarInterface = {
  id: number
  name: string
  color: string
}

export interface WorkingCar extends CarInterface {
  velocity: number
  distance: number
  startTime: number | null
  breakDistance?: number
}

export interface InputState {
  create: Omit<CarInterface, 'id'>
  update: Omit<CarInterface, 'id'> & { id: number | null }
}

export type EngineCommand = 'started' | 'stopped' | 'drive'

export interface WinMessages {
  [n: number]: {
    winner: CarInterface
    time: number
  }
}

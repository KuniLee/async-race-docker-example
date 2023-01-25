import EventEmitter from 'events'
import { AppModelInstance } from '@/components/models/model'
import { Views } from 'types/enums'
import winnersTemplate from '@/templates/winnersTemplate.html'
import { CarInterface, WinnerInterface } from 'types/interfaces'
import rowTemplate from '@/templates/winnerRow.hbs'
import { WINNERS_ON_PAGE } from 'types/constants'

type WinnersViewEventsName = 'NEXT_PAGE' | 'PREV_PAGE' | 'SORT'

export type WinnersViewInstance = InstanceType<typeof WinnersView>

export class WinnersView extends EventEmitter {
  private carsList: Array<CarInterface> = []
  private mainContainer: HTMLElement | undefined
  private nextBtn: HTMLButtonElement | undefined
  private prevBtn: HTMLButtonElement | undefined

  constructor(private model: Readonly<AppModelInstance>) {
    super()
    this.model.on('WINNERS_UPDATED', () => {
      if (this.model.state.view === Views.Winners) this.renderTable()
    })
  }

  emit<T>(event: WinnersViewEventsName, data?: T) {
    return super.emit(event, data)
  }

  on<T>(event: WinnersViewEventsName, callback: (data?: T) => void) {
    return super.on(event, callback)
  }

  async renderView() {
    this.carsList = await this.model.loadCars()
    this.mainContainer = document.body.querySelector('main') as HTMLElement
    if (this.mainContainer) this.mainContainer.innerHTML = winnersTemplate
    this.nextBtn = this.mainContainer?.querySelector('#next') as HTMLButtonElement
    this.prevBtn = this.mainContainer?.querySelector('#prev') as HTMLButtonElement

    this.setSortingBtns()
    this.addListeners()
    this.renderTable()
  }

  private renderTable() {
    const { winners, winnersPage, winnersCount } = this.model.state
    const pageElement = this.mainContainer?.querySelector('#pageNumber') as HTMLSpanElement
    const amountElement = this.mainContainer?.querySelector('#amount') as HTMLSpanElement
    const tableBody = this.mainContainer?.querySelector('tbody') as HTMLTableSectionElement
    pageElement.textContent = winnersPage.toString()
    amountElement.textContent = winnersCount.toString()
    tableBody.innerHTML = ''
    winners.forEach((winner, idx) => {
      tableBody.insertAdjacentHTML('beforeend', this.renderRow(winner, idx))
    })
    this.updatePageBtns()
    this.updateSortingBtns()
  }

  private setSortingBtns() {
    const tableHead = this.mainContainer?.querySelector('thead') as HTMLTableSectionElement
    const winsBnt = tableHead.querySelector('.wins-column') as HTMLElement
    const timeBnt = tableHead.querySelector('.time-column') as HTMLElement
    tableHead.addEventListener('click', (ev) => {
      if (ev.target === winsBnt) this.emit<string>('SORT', 'wins')
      if (ev.target === timeBnt) this.emit<string>('SORT', 'time')
    })
  }

  private renderRow(winner: WinnerInterface, idx: number): string {
    const rowNumber = (this.model.state.winnersPage - 1) * WINNERS_ON_PAGE + (idx + 1)
    const winCar = this.carsList.find((car) => car.id === winner.id)
    return rowTemplate({ ...winCar, ...winner, rowNumber })
  }

  private addListeners() {
    this.nextBtn?.addEventListener('click', () => {
      this.emit('NEXT_PAGE')
    })
    this.prevBtn?.addEventListener('click', () => {
      this.emit('PREV_PAGE')
    })
  }

  private updatePageBtns() {
    const { winnersCount, winnersPage } = this.model.state
    if (this.prevBtn) this.prevBtn.disabled = winnersPage < 2
    if (this.nextBtn) this.nextBtn.disabled = Math.ceil(winnersCount / WINNERS_ON_PAGE) === winnersPage
  }

  private updateSortingBtns() {
    const { column, type } = this.model.state.sorting
    const tableHead = this.mainContainer?.querySelector('thead') as HTMLTableSectionElement
    const winsBnt = tableHead.querySelector('.wins-column') as HTMLElement
    winsBnt.className = 'wins-column'
    if (column === 'wins') {
      winsBnt.classList.add(type.toLowerCase())
    }
    const timeBnt = tableHead.querySelector('.time-column') as HTMLElement
    timeBnt.className = 'time-column'
    if (column === 'time') {
      timeBnt.classList.add(type.toLowerCase())
    }
  }
}

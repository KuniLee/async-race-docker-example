import type { AppModelInstance } from '../models/model'
import { WinnersViewInstance } from '@/components/views/WinnersView'
import { Views } from 'types/enums'

export default class WinnersController {
  constructor(private model: AppModelInstance, private view: WinnersViewInstance) {
    this.model.on('VIEW_CHANGED', async () => {
      if (this.model.state.view === Views.Winners) {
        await this.view.renderView()
        await this.model.loadWinners()
      }
    })
    this.view.on('NEXT_PAGE', () => {
      this.model.loadWinners(this.model.state.winnersPage + 1)
    })
    this.view.on('PREV_PAGE', () => {
      this.model.loadWinners(this.model.state.winnersPage - 1)
    })
    this.view.on<'time' | 'wins'>('SORT', (data) => {
      const { column, type } = this.model.state.sorting
      if (column === 'id' && data) {
        this.model.sortWinners({ column: data, type: 'ASC' })
      } else if (column === data) {
        this.model.sortWinners({ column: data, type: type === 'ASC' ? 'DESC' : 'ASC' })
      } else
        this.model.sortWinners({
          column: column === 'time' ? 'wins' : 'time',
          type: 'ASC',
        })
    })
  }
}

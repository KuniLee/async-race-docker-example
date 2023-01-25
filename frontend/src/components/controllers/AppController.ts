import type { AppModelInstance } from '../models/model'
import type { AppViewInstance } from '../views/AppView'
import { Views } from 'types/enums'

export default class AppController {
  private model: AppModelInstance

  private view: AppViewInstance

  constructor(model: AppModelInstance, view: AppViewInstance) {
    this.model = model
    this.view = view
    this.view.on<Views>('VIEW_CLICK', (view) => {
      if (this.model.state.view !== view) {
        this.model.changeView(view)
      }
    })
    this.view.render()
  }
}

import EventEmitter from 'events'
import { AppModelInstance } from '@/components/models/model'
import { Views } from 'types/enums'

type ItemViewEventsName = 'VIEW_CLICK'

export type AppViewInstance = InstanceType<typeof AppView>

export class AppView extends EventEmitter {
  private model: AppModelInstance
  private viewButtons: HTMLButtonElement[] | undefined

  constructor(model: AppModelInstance) {
    super()
    this.model = model
    this.model.on('VIEW_CHANGED', this.changeView)
  }

  emit<T>(event: ItemViewEventsName, data: T) {
    return super.emit(event, data)
  }

  on<T>(event: ItemViewEventsName, callback: (data: T) => void) {
    return super.on(event, callback)
  }

  render() {
    const header = document.createElement('header')
    header.className = 'container my-2'
    header.append(this.renderViewButtons())
    document.body.append(header)
    document.body.insertAdjacentHTML('beforeend', `<main class='container'></main>`)
  }

  private changeView = () => {
    this.viewButtons?.forEach((btn) => {
      if (btn.textContent?.toLowerCase() === this.model.state.view) btn.classList.add('active')
      else btn.classList.remove('active')
    })
  }

  private renderViewButtons() {
    const btnGroup = document.createElement('div')
    btnGroup.className = 'btn-group'
    this.viewButtons = Object.values(Views).map((view) => {
      const btn = document.createElement('button')
      btn.textContent = view.charAt(0).toUpperCase() + view.slice(1)
      btn.className = 'btn btn-primary'
      return btn
    })
    btnGroup.append(...this.viewButtons)
    btnGroup.addEventListener('click', ({ target }) => {
      if (target instanceof HTMLButtonElement)
        this.emit<Views>('VIEW_CLICK', target.textContent?.toLowerCase() as Views)
    })
    return btnGroup
  }
}

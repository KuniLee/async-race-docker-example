import '@/styles/bootstrap.scss'
import '@/styles/main.scss'

import { AppModel } from '@/components/models/model'
import { AppView } from '@/components/views/AppView'
import AppController from '@/components/controllers/AppController'
import GarageController from '@/components/controllers/GarageController'
import { GarageView } from '@/components/views/GarageView'
import { WinnersView } from '@/components/views/WinnersView'
import WinnersController from '@/components/controllers/WinnersController'
import { Views } from 'types/enums'

const model = new AppModel()

const appView = new AppView(model)
const garageView = new GarageView(model)
const winnersView = new WinnersView(model)
const appController = new AppController(model, appView)
const garageController = new GarageController(model, garageView)
const winnersController = new WinnersController(model, winnersView)

model.changeView(Views.Garage)

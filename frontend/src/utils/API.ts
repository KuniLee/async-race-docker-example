import { CarInterface, EngineCommand, WinnerInterface } from 'types/interfaces'
import { Resource } from 'types/enums'
import { API_ULR, CARS_ON_PAGE, WINNERS_ON_PAGE } from 'types/constants'

function getResourceURL(resource: Resource) {
  return `${API_ULR}/${resource}`
}

export async function getWinners(
  page: number,
  sort: 'id' | 'wins' | 'time',
  order: 'ASC' | 'DESC',
  limit = WINNERS_ON_PAGE
): Promise<{ items: Array<WinnerInterface>; count: number }> {
  const url = getResourceURL(Resource.Winners)
  const response = await fetch(`${url}?_page=${page}&_limit=${limit}&_sort=${sort}&_order=${order}`)
  return {
    items: await response.json(),
    count: Number(response.headers.get('X-Total-Count')),
  }
}

export async function getCars(
  page?: number,
  limit = CARS_ON_PAGE
): Promise<{ items: Array<CarInterface>; count: number }> {
  const url = getResourceURL(Resource.Garage)
  const ulrString = page ? `${url}?_page=${page}&_limit=${limit}` : url
  try {
    const response = await fetch(ulrString)
    return {
      items: await response.json(),
      count: Number(response.headers.get('X-Total-Count')),
    }
  } catch (e) {
    error(e)
    return {
      items: [],
      count: 0,
    }
  }
}

export async function getWinner(id: number): Promise<WinnerInterface | undefined> {
  const url = getResourceURL(Resource.Winners)
  try {
    const response = await fetch(url + `/${id}`)
    return await response.json()
  } catch (e) {
    error(e)
  }
}

export async function createItem(
  resource: Resource,
  item: CarInterface | WinnerInterface
): Promise<{ items: Array<CarInterface | WinnerInterface> }> {
  const url = getResourceURL(resource)
  const body = JSON.stringify(item)
  const headers = { 'Content-Type': 'application/json' }
  const response = await fetch(url, { method: 'POST', body, headers })
  return response.json()
}

export async function changeEngine(item: CarInterface, command: EngineCommand) {
  const url = getResourceURL(Resource.Engine)
  return await fetch(`${url}?id=${item.id}&status=${command}`, { method: 'PATCH' })
}

export async function deleteItem(resource: Resource, id: number): Promise<boolean> {
  const url = getResourceURL(resource)
  await fetch(`${url}/${id}`, { method: 'DELETE' })
  return true
}

export async function updateItem<T>(resource: Resource, item: T): Promise<T | undefined> {
  const data: Partial<T> = { ...item }
  if ('id' in data) {
    // @ts-ignore
    const id = data.id
    // @ts-ignore
    delete data.id
    const url = getResourceURL(resource)
    const body = JSON.stringify(data)
    const headers = { 'Content-Type': 'application/json' }
    const response = await fetch(`${url}/${id}`, { method: 'PUT', body, headers })
    return response.json()
  }
}

function error(e: unknown) {
  if (e instanceof Error) {
    if (e.message.search('fetch') > -1) {
      alert('Нет связи с сервером')
    } else {
      alert('Возникла ошибка: ' + e)
    }
  }
}

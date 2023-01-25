import { CarInterface } from 'types/interfaces'

export default function generateCars(amount: number, excludedNumbers: number[]): CarInterface[] {
  const cars: CarInterface[] = []
  const carModels = [
    { brand: 'Tesla', model: 'Model S' },
    { brand: 'BMW', model: '7 Series' },
    { brand: 'Mercedes-Benz', model: 'S-Class' },
    { brand: 'Audi', model: 'A8' },
    { brand: 'Porsche', model: 'Panamera' },
    { brand: 'Chevrolet', model: 'Camaro' },
    { brand: 'Dodge', model: 'Challenger' },
    { brand: 'Ford', model: 'Mustang' },
    { brand: 'Jeep', model: 'Wrangler' },
    { brand: 'Land Rover', model: 'Range Rover' },
    { brand: 'Alfa Romeo', model: 'Giulia' },
    { brand: 'Aston Martin', model: 'Vantage' },
    { brand: 'Bentley', model: 'Continental' },
    { brand: 'Cadillac', model: 'Escalade' },
    { brand: 'Ferrari', model: '488' },
    { brand: 'Honda', model: 'Civic Type R' },
    { brand: 'Hyundai', model: 'Veloster N' },
    { brand: 'Jaguar', model: 'F-Type' },
    { brand: 'Lamborghini', model: 'Huracan' },
    { brand: 'Mazda', model: 'MX-5' },
    { brand: 'McLaren', model: '720S' },
    { brand: 'Nissan', model: 'GTR' },
    { brand: 'Pagani', model: 'Huayra' },
    { brand: 'Polestar', model: '1' },
    { brand: 'Rolls-Royce', model: 'Phantom' },
    { brand: 'Subaru', model: 'WRX STI' },
    { brand: 'Toyota', model: 'Supra' },
    { brand: 'Volkswagen', model: 'Golf R' },
    { brand: 'Volvo', model: 'S60 Polestar Engineered' },
    { brand: 'W Motors', model: 'Lykan HyperSport' },
  ]
  let currentId = 1

  for (let i = 0; i < amount; i++) {
    const randomBrand = Math.floor(Math.random() * carModels.length)
    const randomModel = Math.floor(Math.random() * carModels.length)
    const model = `${carModels[randomBrand].brand} ${carModels[randomModel].model}`
    const randomColor = getRandomColor()

    while (excludedNumbers.includes(currentId)) {
      currentId++
    }

    cars.push({ id: currentId, name: model, color: randomColor })
    currentId++
  }

  return cars
}

function getRandomColor(): string {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

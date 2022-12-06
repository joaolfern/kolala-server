import * as yup from 'yup'
import { setLocale } from 'yup'
import { pt } from 'yup-locale-pt'

setLocale(pt)

const commonValidations = {
  title: yup.string().max(400).required().label('Título'),
  category: yup.number().required().label('Categoria'),
  datetime: yup.date().required().label('Data e hora').min(Date()),
  lat: yup.number().required().label('Latitude'),
  lng: yup.number().required().label('Longitude'),
  address: yup.string().required().max(2000).label('Local'),
  icon: yup.number().required().label('Ícone'),
  description: yup.string().max(2000).label('Descrição'),
}

const eventValidator = {
  create: yup.object().shape({
    ...commonValidations,
    image: yup.array().min(1).max(6).label('Fotos'),
  }),
  update: ({ currentEventImageCount, removingImagesCount }: { currentEventImageCount: number, removingImagesCount: number }) => yup.object().shape({
    ...commonValidations,
    image: yup.array().label('Fotos').when('removedImages', {
      is: removedImages => removedImages.length >= currentEventImageCount,
      then: yup.array().min(1).max(6).label('Fotos')
    })
  }),
}

export default eventValidator

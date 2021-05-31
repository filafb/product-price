import React from 'react'
import { defineMessages } from 'react-intl'
import { useCssHandles, CssHandlesTypes } from 'vtex.css-handles'
import { useProduct } from 'vtex.product-context'

import InstallmentsRenderer, {
  CSS_HANDLES,
} from './components/InstallmentsRenderer'
import {
  pickMaxInstallmentsOption,
  pickMaxInstallmentsOptionWithNoInterest,
} from './modules/pickInstallments'
import { getDefaultSeller } from './modules/seller'

const messages = defineMessages({
  title: {
    id: 'admin/installments.title',
  },
  description: {
    id: 'admin/installments.description',
  },
  default: {
    id: 'store/installments.default',
  },
})

interface Props {
  message?: string
  markers?: string[]
  installmentsCriteria?: 'max-quantity' | 'max-quantity-no-interest'
  installmentOptionsFilter?: {
    paymentSystemName?: string
    installmentsQuantity?: number
  }
  /** Used to override default CSS handles */
  classes?: CssHandlesTypes.CustomClasses<typeof CSS_HANDLES>
}

function Installments({
  message = messages.default.id,
  markers = [],
  installmentsCriteria = 'max-quantity',
  installmentOptionsFilter,
  classes,
}: Props) {
  const productContextValue = useProduct()
  const { handles } = useCssHandles(CSS_HANDLES, { classes })
  const seller = getDefaultSeller(productContextValue?.selectedItem?.sellers)

  const commercialOffer = seller?.commertialOffer

  if (
    !commercialOffer?.Installments ||
    commercialOffer?.Installments?.length === 0
  ) {
    return null
  }

  let [installmentsOption] = commercialOffer.Installments

  if (installmentsCriteria === 'max-quantity') {
    installmentsOption = pickMaxInstallmentsOption(
      commercialOffer.Installments,
      installmentOptionsFilter
    )
  }

  if (installmentsCriteria === 'max-quantity-no-interest') {
    installmentsOption = pickMaxInstallmentsOptionWithNoInterest(
      commercialOffer.Installments,
      installmentOptionsFilter
    )
  }

  return (
    <InstallmentsRenderer
      message={message}
      markers={markers}
      installment={installmentsOption}
      handles={handles}
    />
  )
}

Installments.schema = {
  title: messages.title.id,
}

export default Installments

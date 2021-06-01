import { ProductTypes } from 'vtex.product-context'

type ClusterBy = keyof ProductTypes.Installment

/**
 * Pick which installments should be used. First it cluster all installments
 * by the value of clusterBy, then picks the cluster with the biggest amount of
 * installments options and then return this list sorted by the amount of installments
 * @param installmentsList All installments
 * @param clusterBy
 */
export default function pickInstallmentsList(
  installmentsList: ProductTypes.Installment[],
  clusterBy: ClusterBy
) {
  const clusteredInstallments = clusterInstallments(installmentsList, clusterBy)

  const pickedInstallments = pickMaxOptionCount(
    clusteredInstallments,
    clusterBy
  )

  return pickedInstallments.sort(
    (a, b) => a.NumberOfInstallments - b.NumberOfInstallments
  )
}

/**
 * Cluster installments by the passed key of installments type
 * @param installmentsList List of installments to be clustered
 * @param clusterBy Key to be clustered by
 */
function clusterInstallments(
  installmentsList: ProductTypes.Installment[],
  clusterBy: keyof ProductTypes.Installment
) {
  const clusteredInstallments: Record<string, ProductTypes.Installment[]> = {}

  for (const installment of installmentsList) {
    if (!clusteredInstallments[installment[clusterBy]]) {
      clusteredInstallments[installment[clusterBy]] = []
    }

    clusteredInstallments[installment[clusterBy]].push(installment)
  }

  return clusteredInstallments
}

/**
 * Pick the cluster with the biggest amount of options, if there are multiple
 * clusters with the biggest amount it will pick the one that has a installment
 * with the biggest NumberOfInstallments of all options
 * @param clusteredInstallments
 * @param clusterBy
 */
function pickMaxOptionCount(
  clusteredInstallments: Record<string, ProductTypes.Installment[]>,
  clusterBy: ClusterBy
) {
  const clusterKeys = Object.keys(clusteredInstallments)
  let maxOptionCount = clusteredInstallments[clusterKeys[0]].length

  for (let i = 1; i < clusterKeys.length; i++) {
    const curOption = clusteredInstallments[clusterKeys[i]]

    if (maxOptionCount < curOption.length) {
      maxOptionCount = curOption.length
    }
  }

  const maxOptions = clusterKeys.filter(
    key => clusteredInstallments[key].length === maxOptionCount
  )

  if (maxOptions.length === 1) {
    return clusteredInstallments[maxOptions[0]]
  }

  let biggestInstallmentsOption =
    clusteredInstallments[maxOptions[0]][0].NumberOfInstallments

  let [biggestInstallmentsOptionKey]: Array<string | number> = maxOptions

  for (const key of maxOptions) {
    for (const installmentsOptions of clusteredInstallments[key]) {
      if (
        installmentsOptions.NumberOfInstallments > biggestInstallmentsOption
      ) {
        biggestInstallmentsOption = installmentsOptions.NumberOfInstallments
        biggestInstallmentsOptionKey = installmentsOptions[clusterBy]
      }
    }
  }

  return clusteredInstallments[biggestInstallmentsOptionKey]
}

function applyFiltersToInstallmentsList(
  installmentsList: ProductTypes.Installment[],
  filteringRules: {
    paymentSystemName?: string
    installmentsQuantity?: number
  }
) {
  let filteredInstallmentsList = installmentsList

  if (filteringRules.paymentSystemName) {
    filteredInstallmentsList = filteredInstallmentsList.filter(
      installmentsOption =>
        installmentsOption.PaymentSystemName ===
        filteringRules.paymentSystemName
    )
  }

  if (filteringRules.installmentsQuantity) {
    filteredInstallmentsList = filteredInstallmentsList.filter(
      installmentsOption =>
        installmentsOption.NumberOfInstallments ===
        filteringRules.installmentsQuantity
    )
  }

  return filteredInstallmentsList
}

export function pickMaxInstallmentsOption(
  installmentsList: ProductTypes.Installment[],
  filteringRules?: {
    paymentSystemName?: string
    installmentsQuantity?: number
  }
) {
  let filteredInstallmentsList = installmentsList

  if (filteringRules) {
    filteredInstallmentsList = applyFiltersToInstallmentsList(
      installmentsList,
      filteringRules
    )
  }

  let [maxInstallmentOption] = filteredInstallmentsList

  filteredInstallmentsList.forEach(installmentOption => {
    if (
      installmentOption.NumberOfInstallments >
      maxInstallmentOption.NumberOfInstallments
    ) {
      maxInstallmentOption = installmentOption
    }
  })

  return maxInstallmentOption
}

export function pickMaxInstallmentsOptionWithNoInterest(
  installmentsList: ProductTypes.Installment[],
  filteringRules?: {
    paymentSystemName?: string
    installmentsQuantity?: number
  }
) {
  let filteredInstallmentsList = installmentsList

  if (filteringRules) {
    filteredInstallmentsList = applyFiltersToInstallmentsList(
      installmentsList,
      filteringRules
    )
  }

  const firstNoInterestOptionIndex = filteredInstallmentsList.findIndex(
    option => option.InterestRate === 0
  )

  // There isn't a no-interest option
  if (firstNoInterestOptionIndex < 0) {
    return pickMaxInstallmentsOption(filteredInstallmentsList)
  }

  let maxWithNoInterest = filteredInstallmentsList[firstNoInterestOptionIndex]

  for (
    let index = firstNoInterestOptionIndex;
    index < filteredInstallmentsList.length;
    index++
  ) {
    const currentInstallmentsPlan = filteredInstallmentsList[index]
    const noInterest = currentInstallmentsPlan.InterestRate === 0

    if (
      currentInstallmentsPlan.NumberOfInstallments >
        maxWithNoInterest.NumberOfInstallments &&
      noInterest
    ) {
      maxWithNoInterest = currentInstallmentsPlan
    }
  }

  return maxWithNoInterest
}

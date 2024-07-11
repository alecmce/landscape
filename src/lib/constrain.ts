import { clamp, positiveMod } from "./math"

export type Constraint = OptionalConstraint | WrapConstraint

export interface OptionalConstraint {
  min?: number
  max?: number
}

export interface WrapConstraint {
  min:  number
  max:  number
  wrap: true
}

export function constrain(value: number, constraint: Constraint): number {
  return isWrapConstriant(constraint)
    ? wrap(constraint)
    : weakClamp(constraint)

  function wrap(constraint: WrapConstraint): number {
    const { min, max } = constraint
    return positiveMod(value - min, max - min) + min
  }

  function weakClamp(constraint: OptionalConstraint): number {
    const { min = -Infinity, max = Infinity } = constraint
    return clamp(value, min, max)
    }

  function isWrapConstriant(constraint: Constraint): constraint is WrapConstraint {
    return (constraint as WrapConstraint).wrap
  }
}

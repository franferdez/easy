import { Func, Get, isDefined, isEmpty, ofGet, Predicate, tryTo } from './index';

class CaseBuilder<V> {
  constructor(readonly v: V) {}

  case<T>(pred: Predicate<V>, out: Func<T, V>): Case<T, V> {
    return new Case<T, V>(this.v).case(pred, out);
  }

  type<T, U = unknown>(guard: (u: unknown) => u is U, out: Func<T, U>): Case<T, V> {
    return new Case<T, V>(this.v).type<U>(guard, out);
  }

  is = {
    defined: <T>(prop: Func<unknown, V>, out: Func<T, V>): Case<T, V> => new Case<T, V>(this.v).case(isDefined(prop(this.v)), out),
    empty: <T>(prop: Func<unknown, V>, out: Func<T, V>): Case<T, V> => new Case<T, V>(this.v).case(isEmpty(prop(this.v)), out),
    not: {
      defined: <T>(prop: Func<unknown, V>, out: Func<T, V>): Case<T, V> => new Case<T, V>(this.v).case(!isDefined(prop(this.v)), out),
      empty: <T>(prop: Func<unknown, V>, out: Func<T, V>): Case<T, V> => new Case<T, V>(this.v).case(!isEmpty(prop(this.v)), out),
    },
  };

  if = this.is;
}

class Case<T, V = unknown> {
  constructor(protected value: V, protected outcome?: T) {}

  case(pred: Predicate<V>, out: Func<T, V>): Case<T, V> {
    return tryTo(pred, this.value)
      .is.true()
      .map(() => out(this.value))
      .map(res => new Found(this.value, res) as Case<T, V>)
      .or(this);
  }

  type<U>(guard: (u: unknown) => u is U, out: Func<T, U>): Case<T, V> {
    return tryTo(guard, this.value)
      .is.true()
      .map(() => out(this.value as unknown as U))
      .map(res => new Found(this.value, res) as Case<T, V>)
      .or(this);
  }

  is = {
    defined: (prop: Func<unknown, V>, out: Func<T, V>): Case<T, V> => new Case<T, V>(this.value).case(isDefined(prop(this.value)), out),
    empty: (prop: Func<unknown, V>, out: Func<T, V>): Case<T, V> => new Case<T, V>(this.value).case(isEmpty(prop(this.value)), out),
    not: {
      defined: (prop: Func<unknown, V>, out: Func<T, V>): Case<T, V> => new Case<T, V>(this.value).case(!isDefined(prop(this.value)), out),
      empty: (prop: Func<unknown, V>, out: Func<T, V>): Case<T, V> => new Case<T, V>(this.value).case(!isEmpty(prop(this.value)), out),
    },
  };

  if = this.is;

  else(alt: Get<T, V>): T {
    return ofGet<T, V>(alt, this.value);
  }
}

class Found<T, V> extends Case<T, V> {
  constructor(protected value: V, protected outcome: T) {
    super(value, outcome);
  }

  case(pred: Predicate<V>, out: Func<T, V>): this {
    return this;
  }

  type<U>(guard: (u: unknown) => u is U, out: Func<T, U>): Case<T, V> {
    return this;
  }

  is = {
    defined: (_prop: Func<unknown, V>, _out: Func<T, V>): Case<T, V> => this,
    empty: (_prop: Func<unknown, V>, _out: Func<T, V>): Case<T, V> => this,
    not: {
      defined: (_prop: Func<unknown, V>, _out: Func<T, V>): Case<T, V> => this,
      empty: (_prop: Func<unknown, V>, _out: Func<T, V>): Case<T, V> => this,
    },
  };

  if = this.is;

  else(alt: Get<T, V>): T {
    return this.outcome;
  }
}

export const choose = <V>(value: V) => new CaseBuilder<V>(value);

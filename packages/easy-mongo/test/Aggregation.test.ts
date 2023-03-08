import '@thisisagile/easy-test';
import { aggregation } from '../src';
import { fits } from '@thisisagile/easy-test';

describe('Aggregation', () => {
  const name = { name: 'Sander' };
  const options = { skip: 10, take: 5 };
  const { id, eq, gt, lt, gte, lte, date, after, before, match, sum, count, group, skip, take, sort, asc, desc } = aggregation;

  test('id', () => {
    expect(id(42)).toMatchObject({ $match: { id: 42 } });
  });

  test('eq', () => {
    expect(eq('name', 42)).toMatchObject({ $match: { name: 42 } });
    expect(eq('prio', { $gt: 0 })).toMatchObject({ $match: { prio: { $gt: 0 } } });
  });

  test('match', () => {
    expect(match(name)).toMatchObject({ $match: name });
  });

  test('gt', () => {
    expect(gt('prio', 10)).toMatchObject({ prio: { $gt: 10 } });
    expect(match(gt('prio', 10))).toMatchObject({ $match: { prio: { $gt: 10 } } });
  });

  test('gte', () => {
    expect(gte('prio', 10)).toMatchObject({ prio: { $gte: 10 } });
  });

  test('lt', () => {
    expect(lt('prio', 10)).toMatchObject({ prio: { $lt: 10 } });
  });

  test('lte', () => {
    expect(lte('prio', 10)).toMatchObject({ prio: { $lte: 10 } });
  });

  test('sum', () => {
    expect(sum('total', 'count')).toMatchObject({ total: { $sum: '$count' } });
    expect(sum('total')).toMatchObject({ total: { $sum: '$total' } });
  });

  test('count', () => {
    expect(count('total')).toMatchObject({ total: { $count: {} } });
  });

  test('date', () => {
    expect(date('lastModified.when')).toMatchObject({
      $dateToString: {
        date: '$lastModified.when',
        format: '%Y-%m-%d',
      },
    });
  });

  test('after', () => {
    expect(after('deleted.when', '2021-06-24T00:00:00.000Z')).toMatchObject({
      $match: { 'deleted.when': { $gte: fits.type(Date) } },
    });
  });

  test('before', () => {
    expect(before('deleted.when', '2021-06-24T00:00:00.000Z')).toMatchObject({
      $match: { 'deleted.when': { $lt: fits.type(Date) } },
    });
  });

  test('group', () => {
    const g = group('brandId').and(sum('total', 'count'));
    expect(g).toMatchObject({ $group: { _id: 'brandId', total: { $sum: '$count' } } });
    const g2 = group(date('created.when')).and(count());
    expect(g2).toMatchObject({
      $group: {
        _id: { $dateToString: { date: '$created.when', format: '%Y-%m-%d' } },
        count: { $count: {} },
      },
    });
    const g3 = group(date('created.when')).and(count(), sum('total'));
    expect(g3).toMatchObject({
      $group: {
        _id: { $dateToString: { date: '$created.when', format: '%Y-%m-%d' } },
        count: { $count: {} },
        total: { $sum: '$total' },
      },
    });
  });

  test('skip', () => {
    expect(skip({})).toBeUndefined();
    expect(skip(options)).toMatchObject({ $skip: options.skip });
  });

  test('take', () => {
    expect(take({})).toBeUndefined();
    expect(take(options)).toMatchObject({ $limit: options.take });
  });

  test('sort', () => {
    expect(sort({})).toBeUndefined();
    expect(sort({ name: 1 })).toMatchObject({ $sort: { name: 1 } });
    expect(sort({ name: 1, email: -1 })).toMatchObject({ $sort: { name: 1, email: -1 } });
  });

  test('asc', () => {
    expect(asc('name')).toMatchObject({ $sort: { name: 1 } });
  });

  test('desc', () => {
    expect(desc('name')).toMatchObject({ $sort: { name: -1 } });
  });
});

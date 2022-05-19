export default class ArrayHelper {
  static orderBy(items, attrs) {
    if (typeof attrs === 'string') {
      attrs = [attrs];
    }

    attrs.reverse().forEach((attr) => {
      const sortDesc = attr.trim().substr(0, 1) === '-';

      if (sortDesc) {
        attr = attr.trim().substr(1);
      }

      items.sort((a, b) => {
        const diff = `${a[attr] ?? ''}`.localeCompare(`${b[attr] ?? ''}`);

        if (sortDesc) {
          return diff * -1;
        }

        return diff;
      });
    });

    return items;
  }

  static groupBy(data, keyAttr = 'key', titleAttr = null) {
    const groups = [];

    data.forEach((item) => {
      const key = item[keyAttr];
      const title = item[titleAttr || keyAttr];

      let group = groups.find((a) => a.key === key);

      if (!group) {
        group = { key, title, data: [] };
        groups.push(group);
      }

      group.data.push(item);
    });

    return groups;
  }

  static uniqueBy(array, keyAttr) {
    return array.filter((item, index) => {
      return index === array.findIndex((a) => a[keyAttr] === item[keyAttr]);
    });
  }

  static remove(array, value) {
    const index = array.indexOf(value);

    if (index !== -1) {
      array.splice(index, 1);
    }

    return array;
  }
}

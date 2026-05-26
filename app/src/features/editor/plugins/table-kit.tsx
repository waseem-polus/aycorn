import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from "@platejs/table/react";

import {
  TableCellElement,
  TableElement,
  TableRowElement,
} from "@/components/ui/table-node";

export const TableKit = [
  TablePlugin.configure({
    options: { initialTableWidth: 600, minColumnWidth: 48 },
  }).withComponent(TableElement),
  TableRowPlugin.withComponent(TableRowElement),
  TableCellPlugin.withComponent(TableCellElement),
  TableCellHeaderPlugin.withComponent(
    (props) => <TableCellElement {...props} isHeader />,
  ),
];

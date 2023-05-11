import React from 'react';
import { createUseStyles } from 'react-jss';
import { DataTableColumnHeader } from '@dhis2/ui';

const useStyles = createUseStyles({
  tableHeader: props => ({
    fontWeight: 'bold !important',
    backgroundColor: '#D9E8F5 !important',
    '& span, input': {
      width: '100%',
    },
    display: props.hidden ? 'none !important' : 'table-cell !important',
  }),
  hidden: {
    display: 'none !important',
  },
});

export default function TableHeader({ column, index }) {
  const classes = useStyles({ hidden: column.hidden });
  return (
    <DataTableColumnHeader
      key={index}
      className={`${classes.tableHeader} ${
        column.hidden ? classes.hidden : ''
      }`}
      width={column.width || 'auto'}
      colSpan={column.headerSpan || 'auto'}
      hidden={!column.name}
      style={{
        display: !column.name ? 'none !important' : 'table-cell',
      }}
    >
      {column.name}
    </DataTableColumnHeader>
  );
}

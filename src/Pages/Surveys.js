import React, { useState, useEffect } from 'react';
import { getResponses } from '../api/api';
import { createUseStyles } from 'react-jss';
import Card from '../components/Card';
import { format } from 'date-fns';
import Table from '../components/Table';
import { Popconfirm, Button } from 'antd';
import { Link } from 'react-router-dom';
import { TabBar, Tab } from '@dhis2/ui';
import Empty from '../components/Empty';
import Notification from '../components/Notification';

const useStyles = createUseStyles({
  actions: {
    '& button': {
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      textDecoration: 'underline',
      margin: '0 3px',
      padding: 0,
    },
  },
  edit: {
    color: '#005a8e',
  },
  delete: {
    color: '#f44336',
  },
});

export default function Surveys({ user }) {
  const [versions, setVersions] = useState([]);
  const [deleted, setDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const classes = useStyles();

  const getVersons = async () => {
    try {
      const data = await getResponses({ dataEntryPersonId: user?.me?.id });
      setVersions(data?.details);
      setLoading(false);
    } catch (error) {
      setError('Error loading versions');
      setLoading(false);
    }
  };

  useEffect(() => {
    getVersons();
  }, [deleted]);

  const columns = [
    {
      name: 'DATE CREATED',
      key: 'createdAt',
      render: row =>
        row.createdAt && format(new Date(row.createdAt), 'dd/MM/yyyy'),
    },
    {
      name: 'STATUS',
      key: 'status',
    },
    {
      name: 'ACTIONS',
      key: 'actions',
      render(row) {
        return (
          <div className={classes.actions}>
            <Link to={`/view/${row.id}`}>
              <button className={classes.edit}>View</button>
            </Link>
          </div>
        );
      },
    },
  ];

  return (
    <Card title='MY SUBMISSIONS'>
      {error && (
        <Notification
          message={error}
          type='error'
          onClose={() => setError(null)}
        />
      )}
      <TabBar>
        <Tab selected>All</Tab>
      </TabBar>
      <div style={{ margin: '1rem 0px' }}>
        <Table
          columns={columns}
          tableData={versions}
          loading={loading}
          emptyMessage={<Empty message='No submissions found' />}
          pageSize={10}
          bordered
          total={versions?.length}
          pagination={versions?.length > 10}
          hidePageSizeSelect
          hidePageSummary
          hidePageSelect
        />
      </div>
    </Card>
  );
}

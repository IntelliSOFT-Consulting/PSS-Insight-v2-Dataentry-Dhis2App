import React, { useState, useEffect, useRef } from 'react';
import { getResponses } from '../api/api';
import { createUseStyles } from 'react-jss';
import Card from '../components/Card';
import { format } from 'date-fns';
import { Input, Space, Button, Table } from 'antd';
import { Link } from 'react-router-dom';
import { TabBar, Tab } from '@dhis2/ui';
import Empty from '../components/Empty';
import Notification from '../components/Notification';
import { SearchOutlined, MailOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import ModalItem from '../components/Modal';

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
    '& > a': {
      textDecoration: 'none',
    },
    '& > a:not(:first-child)::before': {
      content: '" | "',
      textDecoration: 'none !important',
      color: '#005a8e',
    },
  },
  edit: {
    color: '#005a8e',
  },
  delete: {
    color: '#f44336',
  },
  flex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon: {
    border: '2px solid #005a8e',
    borderRadius: '50%',
    width: 25,
    height: 25,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  danger: {
    color: 'white',
    backgroundColor: 'rgb(187, 12, 47)',
    '&:hover': {

      color: 'black !important',
      backgroundColor: 'rgb(187, 12, 47) !important',
    },
  },
});

export default function Surveys({ user }) {
  const [versions, setVersions] = useState([]);
  const [deleted, setDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [comment, setComment] = useState('');

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

  const searchInput = useRef(null);
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters, confirm) => {
    clearFilters();
    setSearchText('');
    confirm();
  };

  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={e => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type='primary'
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size='small'
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters, confirm)}
            size='small'
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => (
      <SearchOutlined
        style={{
          color: filtered ? '#1890ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: visible => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: text =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const columns = [
    {
      title: 'DATE CREATED',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      sortDirections: ['descend', 'ascend'],
      ...getColumnSearchProps('createdAt'),
      render: (_, row) =>
        row.createdAt && format(new Date(row.createdAt), 'dd/MM/yyyy'),
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      ...getColumnSearchProps('status'),
      sorter: (a, b) => a.status.length - b.status.length,
      sortDirections: ['descend', 'ascend'],
      render: (_, row) => row.status?.capitalize(),
    },
    {
      title: 'ACTIONS',
      dataIndex: 'actions',
      key: 'actions',
      render(_, row) {
        return (
          <div className={classes.flex}>
            <div className={classes.actions}>
              <Link to={`/view/${row.id}`}>
                <button className={classes.edit}>View</button>
              </Link>
              {row.status === 'DRAFT' ||
                (row.status === 'REVISED' && (
                  <Link to={`/edit/${row.id}`}>
                    <button className={classes.edit}>Edit</button>
                  </Link>
                ))}
            </div>
            {row.comments && (
              <div className={classes.icon}>
                <MailOutlined
                  style={{ color: '#005a8e' }}
                  onClick={() => setComment(row.comments)}
                />
              </div>
            )}
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
          status='error'
          onClose={() => setError(null)}
        />
      )}
      <TabBar>
        <Tab selected>All</Tab>
      </TabBar>
      <div style={{ margin: '1rem 0px' }}>
        <Table
          columns={columns}
          dataSource={[...versions]}
          loading={loading}
          size='small'
          locale={{
            emptyText: <Empty message='No submissions yet' />,
          }}
          bordered
          pagination={versions.length > 15 ? { pageSize: 15 } : false}
          rowClassName={record => {
            if (record.status === 'REJECTED') return classes.delete;
            if (record.status === 'REVISED') return classes.danger;
          }}
        />
      </div>
      <ModalItem
        type='info'
        title='Comments'
        visible={comment}
        footer={null}
        onCancel={() => setComment('')}
      >
        <div>
          <p>{comment}</p>
        </div>
      </ModalItem>
    </Card>
  );
}

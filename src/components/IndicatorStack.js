import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';
import Table from './Table';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import InfoModal from './InfoModal';
import FormInput from './FormDef';
import { attachFile } from '../api/api';

const useStyles = createUseStyles({
  indicatorStack: {
    display: 'flex',
    margin: '10px 0',
    border: '1px solid #e0e0e0',
  },
  indicatorCheckbox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorTable: {
    width: '100%',
  },

  tableFlex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: '3rem',
    position: 'relative',
    width: '100%',
  },
  info: {
    position: 'absolute !important',
    right: '0',
    cursor: 'pointer',
    width: '1.5rem',
    height: '1.5rem',
    color: '#0067B9',
  },
});

export default function IndicatorStack({ indicator, formik, isView, fileNames, setFileNames }) {
  const classes = useStyles();
  const [infoModal, setInfoModal] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = async (files, indicatorId) => {
    try {
      const file = files[0];
      setFileNames({ ...fileNames, [indicatorId]: file.name });
      const formData = new FormData();
      formData.append('file', file);
      const response = await attachFile(formData);

      if (response) {
        formik.setFieldValue(`${indicatorId}_file`, response.id);
      }
    } catch (error) {
      setError(error);
    }
  };


  const columns = [
    {
      name: indicator.categoryName || '',
      key: 'code',
      width: '7rem',
    },
    {
      name: (
        <div className={classes.tableFlex}>
          <span>{indicator.indicatorName || ''}</span>
          <ExclamationCircleIcon
            className={classes.info}
            onClick={() => setInfoModal(indicator)}
          />
        </div>
      ),
      headerSpan: 4,
      key: 'name',
      render: row => (
        <div className={classes.tableFlex}>
          <span>{row.name}</span>
        </div>
      ),
      width: 'calc(100% - 62rem) !important',
    },
    {
      name: '',
      key: 'indicatorId',
      render: row => (
        <FormInput
          type={row.valueType || 'NUMBER'}
          name={row.id}
          value={formik.values[row.id]}
          onChange={({ value }) => formik.setFieldValue(row.id, value)}
          formik={formik}
          disabled={isView}
        />
      ),
      width: '20rem',
      hidden: true,
    },
    {
      name: '',
      render: row => (
        <FormInput
          type='TEXT'
          name={`${row.id}_comment`}
          value={formik.values[`${row.id}_comment`] || ''}
          onChange={({ value }) =>
            formik.setFieldValue(`${row.id}_comment`, value)
          }
          formik={formik}
          disabled={isView}
          placeholder='Enter Comment'
        />
      ),
      width: '20rem',
      hidden: true,
    },
    {
      name: '',
      render: row => (
        <FormInput
          type='FILE'
          name={`${row.id}_file`}
          value={formik.values[`${row.id}_file`] || ''}
          formik={formik}
          disabled={isView}
          description={fileNames[row.id] || 'Attach Document'}
          ghost={true}
          onChange={({ files }) => handleFileUpload(files, row.id)}
        />
      ),
      width: '10rem',
      hidden: true,
    },

  ];

  return (
    <div className={classes.indicatorStack}>
      <div className={classes.indicatorTable}>
        {
          <Table
            columns={columns}
            tableData={indicator.indicatorDataValue}
            activeIndicator={true}
            bordered
          />
        }
      </div>

      <InfoModal
        key={infoModal?.indicatorId}
        title={`${infoModal?.code || ''} DEFINITION`}
        onCancel={() => setInfoModal(null)}
        open={infoModal}
        type='info'
        footer={null}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Table, Checkbox } from 'antd';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import InfoModal from './InfoModal';
import FormInput from './FormDef';
import { attachFile } from '../api/api';
import Notification from './Notification';
import {
  divideIndicatorQuestions,
  resetIndicatorResponse,
} from '../lib/surveyControllers';

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
  table: {
    '& tr, td, p, span': {
      fontSize: '1em !important',
      fontWeight: '300 !important',
    },
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
    top: '0',
    cursor: 'pointer',
    width: '1.5rem',
    height: '1.5rem',
    color: '#0067B9',
  },
  indicatorRow: {
    backgroundColor: '#D9E8F5 !important',
    fontWeight: '500 !important',
    '& td, span': {
      backgroundColor: '#D9E8F5 !important',
      fontWeight: '500 !important',
    },
    '& :hover, tr': {
      backgroundColor: '#D9E8F5 !important',
    },
  },
  subQuestionsRow: {
    backgroundColor: '#F5F5F5 !important',
    '& td': {
      backgroundColor: '#F5F5F5 !important',
    },
    '& :hover, tr': {
      backgroundColor: '#F5F5F5 !important',
    },
  },
  checkbox: {
    '& span': {
      fontWeight: '500 !important',
    },
    '& .ant-checkbox-checked': {
      '& .ant-checkbox-inner': {
        backgroundColor: 'white !important',
        borderColor: '#064972 !important',
        position: 'relative',
        borderRadius: '2px',
        display: 'flex !important',
        justifyContent: 'center',
        alignItems: 'center',
        '&:after': {
          content: '""',
          width: '12px',
          height: '12px',
          backgroundColor: '#064972 !important',
          transform: 'initial !important',
          position: 'relative !important',
          top: '0px !important',
          insetInlineStart: '0px !important',
          border: 'none !important',
          transition: 'all 0.3s ease-in-out !important',
        },
      },
    },
    '&:hover': {
      '& .ant-checkbox-checked': {
        '& .ant-checkbox-inner': {
          '&:after': {
            border: 'none !important',
          },
        },
      },
    },
  },
});

export default function IndicatorStack({
  indicator,
  disabled,
  fileNames,
  setFileNames,
  referenceSheet,
  responses,
  setResponses,
}) {
  const classes = useStyles();
  const [infoModal, setInfoModal] = useState(null);
  const [answerAssessment, setAnswerAssessment] = useState(true);
  const [error, setError] = useState(null);

  const changeHandler = (field, value, indicatorId) => {
    setResponses(prevResponses => {
      const updatedResponses = prevResponses.map(response =>
        response.indicator === indicatorId
          ? { ...response, [field]: value }
          : response
      );

      if (
        updatedResponses.every(response => response.indicator !== indicatorId)
      ) {
        updatedResponses.push({ indicator: indicatorId, [field]: value });
      }

      return updatedResponses;
    });
  };

  const handleFileUpload = async (files, indicatorId) => {
    try {
      setFileNames(prevFileNames => ({
        ...prevFileNames,
        [indicatorId]: 'Uploading...',
      }));

      const file = files[0];
      const fileName = file.name;
      const formData = new FormData();
      formData.append('file', file);

      const response = await attachFile(formData);

      if (response) {
        changeHandler('attachment', response.id, indicatorId);
        setFileNames(prevFileNames => ({
          ...prevFileNames,
          [indicatorId]: fileName,
        }));
      }
    } catch (error) {
      changeHandler('attachment', null, indicatorId);
      setError('Error uploading file');
    }
  };

  const getValue = (indicatorId, field) => {
    const response = responses.find(
      response => response.indicator === indicatorId
    );
    if (response) {
      return response[field];
    }
    return null;
  };

  const labelAttachment = indicatorId => {
    const fileName = fileNames[indicatorId];
    if (fileName) {
      return fileName;
    }
    const value = getValue(indicatorId, 'attachment');
    if (!fileName && value) {
      return 'File attached';
    }
    return 'Attach file';
  };
  const formattedQuestions = divideIndicatorQuestions(indicator);

  const sharedOnCell = (_, index) => {
    if (index === 1) {
      return {
        colSpan: 0,
      };
    }
    return {};
  };

  const handleSelectQuestions = checked => {
    if (checked) {
      const [question] = formattedQuestions;
      const filteredResponses = responses.filter(
        response => response.indicator !== question?.id
      );
      const { [question?.id]: deleted, ...remainingFileNames } = fileNames;

      resetIndicatorResponse([question?.id]);
      setResponses(filteredResponses);
      setFileNames(remainingFileNames);

      return setAnswerAssessment(checked);
    }

    const questions = formattedQuestions.slice(2);
    const questionIds = new Set(questions.map(question => question?.id));
    const filteredResponses = responses.filter(
      response => !questionIds.has(response.indicator)
    );
    const filteredFileNames = Object.fromEntries(
      Object.entries(fileNames).filter(([key]) => !questionIds.has(key))
    );

    resetIndicatorResponse([...questionIds]);
    setResponses(filteredResponses);
    setFileNames(filteredFileNames);

    return setAnswerAssessment(checked);
  };

  const disabledQuestion = index => {
    return (
      (index > 1 && !answerAssessment) || (index === 0 && answerAssessment)
    );
  };

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: '5rem',
    },
    {
      title: 'name',
      key: 'name',

      onCell: (_, index) => ({
        colSpan: index === 1 ? 5 : 1,
      }),
      render: (_, row, index) => {
        if (index === 1) {
          return (
            <div className={classes.tableFlex}>
              <Checkbox
                checked={answerAssessment}
                onChange={({ target }) => {
                  handleSelectQuestions(target.checked);
                }}
                disabled={disabled}
                className={classes.checkbox}
              >
                Fill Assessment Question
              </Checkbox>
            </div>
          );
        }
        return row?.name;
      },
      width: 'auto',
    },
    {
      title: 'Indicator',
      key: 'indicatorId',
      render: (_, row, index) => (
        <FormInput
          type={row?.valueType || 'NUMBER'}
          name={row?.id}
          id={row?.id}
          value={getValue(row?.id, 'response')}
          onChange={({ value }) => {
            changeHandler('response', value, row?.id);
          }}
          disabled={disabled || disabledQuestion(index)}
        />
      ),
      width: '20%',
      onCell: sharedOnCell,
    },
    {
      title: 'Comment',
      render: (_, row, index) => (
        <FormInput
          type='TEXT'
          name={`${row?.id}_comment`}
          id={`${row?.id}_comment`}
          value={getValue(row?.id, 'comment')}
          onChange={({ value }) => changeHandler('comment', value, row?.id)}
          disabled={disabled || disabledQuestion(index)}
          placeholder='Enter Comment'
        />
      ),
      width: '20%',
      onCell: sharedOnCell,
    },
    {
      name: 'Attachment',
      render: (_, row, index) => (
        <div className={classes.tableFlex}>
          <FormInput
            type='FILE'
            name={`${row?.id}_file`}
            id={`${row?.id}_file`}
            value={getValue(row?.id, 'attachment')}
            disabled={disabled || disabledQuestion(index)}
            description={labelAttachment(row?.id)}
            ghost={true}
            onChange={({ files }) => handleFileUpload(files, row?.id)}
          />
          {index === 0 && (
            <ExclamationCircleIcon
              className={classes.info}
              onClick={() => setInfoModal(indicator)}
            />
          )}
        </div>
      ),
      onCell: sharedOnCell,
      width: '15%',
    },
  ];

  return (
    <div className={classes.indicatorStack}>
      <div className={classes.indicatorTable}>
        {
          <Table
            columns={columns}
            dataSource={formattedQuestions}
            activeIndicator={true}
            bordered
            showHeader={false}
            pagination={false}
            size='small'
            className={classes.table}
            rowClassName={(_, index) => {
              if (index === 0) return classes.indicatorRow;
              if (index > 1 && !answerAssessment)
                return classes.subQuestionsRow;
            }}
          />
        }
      </div>

      <InfoModal
        key={infoModal?.indicatorId}
        title={`${infoModal?.categoryName || ''} DEFINITION`}
        onCancel={() => setInfoModal(null)}
        open={infoModal}
        type='info'
        footer={null}
        referenceSheet={referenceSheet}
      />
      {error && (
        <Notification
          status='error'
          message={error}
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
}

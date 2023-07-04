import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import { Select, Button } from 'antd';
import {
  saveResponse,
  getSurvey,
  getResponseDetails,
  updateResponse,
} from '../api/api';
import classes from '../App.module.css';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import IndicatorStack from '../components/IndicatorStack';
import Accordion from '../components/Accordion';
import Loading from '../components/Loader';
import { createUseStyles } from 'react-jss';
import { useParams, useNavigate } from 'react-router-dom';
import { groupQuestions } from '../lib/utils';
import Notification from '../components/Notification';

const useStyles = createUseStyles({
  alertBar: {
    position: 'fixed !important',
    top: '3.5rem',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  formItem: {
    width: '100%',
  },
  errorText: {
    color: 'red',
    fontSize: '0.75rem',
    marginTop: '0.25rem',
  },
});

const validationSchema = Yup.object({
  selectedPeriod: Yup.string().required('Select a period'),
});

export default function NewResponse({ user }) {
  const [loadingSurvey, setLoadingSurvey] = useState(true);
  const [survey, setSurvey] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [fileNames, setFileNames] = useState({});
  const [referenceSheet, setReferenceSheet] = useState('');
  const [responses, setResponses] = useState([]);

  const { id } = useParams();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      isPublished: false,
      selectedPeriod: null,
    },
    validationSchema,
    onSubmit: async values => {
      try {
        const data = {
          orgUnit: user?.me?.organisationUnits[0]?.id,
          selectedPeriod: values.selectedPeriod,
          dataEntryPersonId: user?.me?.id,
          dataEntryDate: new Date(),
          responses,
          isPublished: values.isPublished,
          dataEntryPerson: {
            id: user?.me?.id,
            username: user?.me?.username,
            firstName: user?.me?.firstName,
            surname: user?.me?.surname,
            email: user?.me?.email,
          },
        };
        let response;
        if (id) {
          response = await updateResponse(id, data);
        } else {
          response = await saveResponse(data);
        }
        if (response) {
          setError(false);
          setSuccess('Response saved successfully');
          setTimeout(() => {
            window.scrollTo(0, 0);
            navigate('/');
          }, 1000);
        }
      } catch (error) {
        setError('Error saving response');
        setSuccess(false);
      }
    },
  });

  const isView =
    loadingSurvey ||
    window.location.href.includes('view') || 
    (id && formik.values.isPublished);
  const loadResponse = async () => {
    try {
      setLoadingSurvey(true);
      const response = await getResponseDetails(id);
      const groupedData = groupQuestions(response?.indicators?.details);
      setReferenceSheet(response?.referenceSheet);
      setSurvey(groupedData);
      setLoadingSurvey(false);
      const formatResponses = response?.responses?.map(item => ({
        ...item,
        response:
          item.response === 'true'
            ? true
            : item.response === 'false'
            ? false
            : item.response,
      }));
      setResponses(formatResponses);
      formik.setFieldValue('selectedPeriod', response?.selectedPeriod);
      formik.setFieldValue('dataEntryDate', response?.dataEntryDate);
      formik.setFieldValue('isPublished', response?.status === 'PUBLISHED');
    } catch (error) {
      setError('Error loading response');
    } finally {
      setLoadingSurvey(false);
    }
  };
  useEffect(() => {
    if (id) {
      loadResponse();
    }
  }, [id]);

  const loadSurvey = async () => {
    try {
      formik.resetForm();
      setResponses([]);
      setLoadingSurvey(true);
      const response = await getSurvey();
      const groupedData = groupQuestions(response?.details);
      setReferenceSheet(response?.referenceSheet);
      setSurvey(groupedData);
      setLoadingSurvey(false);
    } catch (error) {
      setError('Error loading survey');
      setLoadingSurvey(false);
    }
  };

  useEffect(() => {
    if (!id) {
      loadSurvey();
    }
  }, [id]);

  const styles = useStyles();

  const years = Array.from(new Array(15), (val, index) => {
    const year = new Date().getFullYear() - index;
    return {
      label: year,
      value: year,
    };
  });

  useEffect(() => {
    if (success) {
      formik.resetForm();
      const successTimeout = setTimeout(() => {
        setSuccess(false);
      }, 3000);

      return () => clearTimeout(successTimeout);
    }
  }, [success]);

  useEffect(() => {
    if (formik.errors.selectedPeriod && formik.touched.selectedPeriod) {
      const component = document.getElementById('selectedPeriod');
      component.scrollIntoView({ behavior: 'smooth' });
    }
  }, [formik.errors.selectedPeriod, formik.touched.selectedPeriod]);

  const footer = (
    <div className={classes.cardFooter}>
      <Button
        name='Small button'
        onClick={() => {
          formik.handleReset();
          setResponses([]);
          navigate('/');
        }}
        small
        value='default'
        className={classes.btnCancel}
      >
        Cancel
      </Button>
      <Button
        name='Small Primary button'
        onClick={() => {
          formik.setFieldValue('isPublished', false);
          formik.handleSubmit();
        }}
        small
        value='default'
        className={classes.btnPublish}
        loading={formik.isSubmitting && !formik.values.isPublished}
      >
        Save Darft
      </Button>
      <Button
        name='Small button'
        onClick={() => {
          formik.setFieldValue('isPublished', true);
          formik.handleSubmit();
        }}
        small
        value='default'
        className={classes.btnSuccess}
        loading={formik.isSubmitting && formik.values.isPublished}
      >
        Submit
      </Button>
    </div>
  );

  return (
    <Card title='DATA ENTRY' footer={isView ? null : footer}>
      {success && (
        <Notification
          status='success'
          title='Success'
          message={success}
          onClose={() => setSuccess(false)}
        />
      )}
      {error && (
        <Notification
          status='error'
          title='Error'
          message={error}
          onClose={() => setError(false)}
        />
      )}
      <form className={classes.formGrid}>
        <div className={styles.formItem}>
          <Select
            name='selectedPeriod'
            placeholder='Select year'
            label='Period'
            id='selectedPeriod'
            options={years}
            disabled={isView}
            style={{ width: '100%' }}
            value={formik.values.selectedPeriod}
            onChange={value => formik.setFieldValue('selectedPeriod', value)}
            size='large'
            status={
              formik.touched.selectedPeriod && formik.errors.selectedPeriod
                ? 'error'
                : null
            }
          />
          {formik.touched.selectedPeriod && formik.errors.selectedPeriod && (
            <div className={styles.errorText}>
              {formik.errors.selectedPeriod}
            </div>
          )}
        </div>
      </form>
      <div className={classes.indicatorsSelect}>
        {loadingSurvey ? (
          <Loading />
        ) : (
          <div className={classes.survey}>
            {survey?.map(indicator => (
              <Accordion
                key={indicator.categoryName}
                title={indicator.categoryName}
              >
                {indicator.indicators.map(indicator => (
                  <IndicatorStack
                    disabled={isView}
                    key={indicator.categoryId}
                    indicator={indicator}
                    onChange={() => {}}
                    formik={formik}
                    fileNames={fileNames}
                    setFileNames={setFileNames}
                    referenceSheet={referenceSheet}
                    responses={responses}
                    setResponses={setResponses}
                  />
                ))}
              </Accordion>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

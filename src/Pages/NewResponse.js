import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import {
  Field,
  Input,
  TextArea,
  AlertBar,
  SingleSelectField,
  SingleSelectOption,
} from '@dhis2/ui';
import { Select, Button } from 'antd';
import { saveResponse, getSurvey, getResponseDetails } from '../api/api';
import classes from '../App.module.css';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import IndicatorStack from '../components/IndicatorStack';
import Accordion from '../components/Accordion';
import Loading from '../components/Loader';
import { createUseStyles } from 'react-jss';
import { useParams, useNavigate } from 'react-router-dom';
import FormItem from 'antd/es/form/FormItem';
import { groupQuestions, loadData, transformSubmissions } from '../lib/utils';

const { Option } = Select;

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

export default function NewResponse({ user, orgUnit }) {
  const [loadingSurvey, setLoadingSurvey] = useState(true);
  const [survey, setSurvey] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [fileNames, setFileNames] = useState({});

  const { id } = useParams();
  const navigate = useNavigate();

  const isView = window.location.href.includes('view');

  const formik = useFormik({
    initialValues: {
      isPublished: false,
      selectedPeriod: '',
    },
    validationSchema,
    onSubmit: async values => {
      try {
        const responses = transformSubmissions(values);
        const data = {
          ...responses,
          orgUnit: orgUnit?.id,
          selectedPeriod: values.selectedPeriod,
          dataEntryPersonId: user?.me?.id,
          dataEntryDate: new Date(),
        };
        let response;
        if (id) {
          //   response = await updateVersion(id, data);
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

  const loadResponse = async () => {
    try {
      setLoadingSurvey(true);
      const response = await getResponseDetails(id);
      const groupedData = loadData(response);
      formik.values = groupedData;
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
      setLoadingSurvey(true);
      const response = await getSurvey();
      const groupedData = groupQuestions(response?.details);
      setSurvey(groupedData);
      setLoadingSurvey(false);
    } catch (error) {
      setError('Error loading survey');
      setLoadingSurvey(false);
    }
  };

  useEffect(() => {
    loadSurvey();
  }, []);

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

  const footer = (
    <div className={classes.cardFooter}>
      <Button
        name='Small button'
        onClick={formik.handleReset}
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
        <AlertBar
          duration={3000}
          icon
          success
          onHidden={() => setSuccess(false)}
          className={styles.alertBar}
        >
          {success}
        </AlertBar>
      )}
      {error && (
        <AlertBar
          duration={3000}
          icon
          critical
          onHidden={() => setError(false)}
          className={styles.alertBar}
        >
          {error}
        </AlertBar>
      )}
      <form className={classes.formGrid}>
        <div className={styles.formItem}>
          <Select
            name='selectedPeriod'
            placeholder='Select year'
            label='Period'
            options={years}
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

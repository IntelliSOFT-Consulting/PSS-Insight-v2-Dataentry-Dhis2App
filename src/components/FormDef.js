import React from 'react';
import {
  Field,
  Radio,
  Input,
  SingleSelect,
  SingleSelectField,
  SingleSelectOption,
  TextArea,
  FileInput,
} from '@dhis2/ui';
import classes from '../App.module.css';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  radioGroup: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    '& > div': {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      '& > label': {
        margin: '0px 10px !important',
      },
    },
  },
  ghost: ({ ghost }) =>
    ghost
      ? {
          '& button': {
            border: 'none !important',
            backgroundColor: 'transparent !important',
            cursor: 'pointer',
            color: '#0067B9',
            textDecoration: 'underline',
            fontSize: '12px !important',
            '& svg': {
              display: 'none',
            },
          },
        }
      : {},
});

export default function FormInput({
  type,
  onChange,
  value,
  options = [],
  ...rest
}) {
  const styles = useStyles(rest);

  const fieldProps = {
    error: rest.error,
    validationText: rest.validationText,
    label: rest.label,
    required: rest.required,
    name: rest.name,
  };

  const booleanOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];

  return (
    <>
      {type === 'NUMBER' && (
        <Field {...fieldProps}>
          {rest.description && (
            <p className={classes.inputDescription}>{rest.description}</p>
          )}
          <Input
            type='number'
            autoComplete='off'
            name={rest.name}
            value={value}
            onChange={onChange}
            error={rest.error}
            placeholder={rest.placeholder || 'Enter Number'}
            disabled={rest.disabled}
          />
        </Field>
      )}
      {type === 'TEXT' && (
        <Field {...fieldProps}>
          {rest.description && (
            <p className={classes.inputDescription}>{rest.description}</p>
          )}
          <Input
            type='text'
            autoComplete='off'
            name={rest.name}
            value={value}
            onChange={onChange}
            error={rest.error}
            placeholder={rest.placeholder}
            disabled={rest.disabled}
          />
        </Field>
      )}
      {type === 'TEXTAREA' && (
        <Field {...fieldProps}>
          {rest.description && (
            <p className={classes.inputDescription}>{rest.description}</p>
          )}
          <TextArea
            name={rest.name}
            autoComplete='off'
            value={value}
            onChange={onChange}
            error={rest.error}
            placeholder={rest.placeholder}
            disabled={rest.disabled}
          />
        </Field>
      )}
      {type === 'BOOLEAN' && (
        <Field {...fieldProps} className={styles.radioGroup}>
          {rest.description && (
            <p className={classes.inputDescription}>{rest.description}</p>
          )}
          {booleanOptions.map(option => (
            <Radio
              key={option.label}
              label={option.label}
              name={rest.name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              disabled={rest.disabled}
            />
          ))}
        </Field>
      )}
      {type === 'SELECT' && (
        <SingleSelectField {...fieldProps}>
          {rest.description && (
            <p className={classes.inputDescription}>{rest.description}</p>
          )}
          <SingleSelect
            name={rest.name}
            selected={value}
            onChange={onChange}
            error={rest.error}
            disabled={rest.disabled}
          >
            {options.map(option => (
              <SingleSelectOption
                key={option.value}
                label={option.label}
                value={option.value}
                disabled={rest.disabled}
              />
            ))}
          </SingleSelect>
        </SingleSelectField>
      )}
      {type === 'FILE' && (
        <Field {...fieldProps}>
          <FileInput
            name={rest.name}
            value={value}
            onChange={onChange}
            error={rest.error}
            className={styles.ghost}
            buttonLabel={rest.description}
            disabled={rest.disabled}
          />
        </Field>
      )}
    </>
  );
}

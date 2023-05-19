String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.toLowerCase().slice(1);
};

export const groupQuestions = data => {
  const categories = data.map(category => category.categoryName);
  const uniqueCategories = [...new Set(categories)];
  const formattedData = uniqueCategories.map(category => {
    const indicators = data
      .filter(item => item.categoryName === category)
      .map(item => item.indicators);
    const mergedIndicators = [].concat.apply([], indicators);
    return { categoryName: category, indicators: mergedIndicators };
  });
  return formattedData;
};

export const transformSubmissions = submissions => {
  const { selectedPeriod, isPublished, ...responses } = submissions;
  const filteredKeys = Object.keys(responses).filter(
    key => !key.match(/(_comment|_file)$/)
  );

  const uniqueKeys = [...new Set(filteredKeys)];
  const responseArray = uniqueKeys.map(key => {
    return {
      indicator: key,
      response: responses[key],
      comments: responses[`${key}_comment`],
      attachment: responses[`${key}_file`],
    };
  });
  return { selectedPeriod, isPublished, responses: responseArray };
};

export const populateResponse = responses => {
  const datas = responses.map(response => {
    return response.responses.map(response => {
      const object = {};
      if (response.comment) {
        object[`${response.indicator}_comment`] = response.comment;
      }
      if (response.attachment) {
        object[`${response.indicator}_file`] = response.attachment;
      }
      if (response.response) {
        object[response.indicator] = response.response;
      }
      return object;
    });
  });
  return datas;
};

export const loadData = data => {
  const { responses, ...rest } = data;
  const transformedData = responses.reduce((acc, response) => {
    const { indicator, response: value, comment, attachment } = response;

    acc[indicator] = value;
    acc[`${indicator}_comment`] = comment;
    acc[`${indicator}_file`] = attachment;

    return acc;
  }, {});
  return { ...rest, ...transformedData };
};

export const divideIndicatorQuestions = indicator => {
  const mainQuestion = indicator?.indicatorDataValue?.find(
    item => item?.code === indicator?.categoryName
  );
  const subQuestions = indicator?.indicatorDataValue?.filter(
    item => item?.code !== indicator?.categoryName
  );
  const answerMain = {
    name: 'Fill Assessment Question',
    code: '',
    valueType: 'CHECKBOX',
  };
  const arr = [mainQuestion, answerMain, ...subQuestions];
  return arr;
};

export const resetIndicatorResponse = ids => {
  ids.forEach(id => {
    const response = document.getElementById(`${id}`);
    const comment = document.getElementById(`${id}_comment`);
    const file = document.getElementById(`${id}_file`);
    if (response) {
      response.value = null;
    }
    if (comment) {
      comment.value = null;
    }
    if (file) {
      file.value = null;
    }
  });
};

const response = (res, status, message, data = null) => {

  if (status >= 200 && status < 300) {

    res.status(status).json({
      success: true, 
      message, 
      data 
    });

  } else {
    res.status(status).json({
      success: false, 
      message, 
      data
    });
  }
};

module.exports = {
  response,
};
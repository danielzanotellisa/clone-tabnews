function can(userTryingToRequest, feature) {
  return userTryingToRequest?.features?.includes(feature);
}

const authorization = {
  can,
};

export default authorization;

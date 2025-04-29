const API_KEY = 'my-secret-key';

const apiKeyAuth = (req, res, next) => {
  const clientKey = req.header('x-api-key');

  if (!clientKey || clientKey !== API_KEY) {
    return res.status(401).json({ message: 'Unauthorized – invalid or missing API key' });
  }

  next();
};

export default apiKeyAuth;
try {
  console.log('Starting Review Service test...');
  const ReviewServiceModule = await import('./server/microservices/review-service/ReviewService.ts');
  console.log('Module imported successfully');
  const ReviewService = ReviewServiceModule.default;
  console.log('ReviewService class extracted:', typeof ReviewService);
  const instance = new ReviewService();
  console.log('ReviewService instance created');
  console.log('Health check:', instance.getHealth ? 'Available' : 'Not available');
  console.log('Router method:', typeof instance.getRouter);
} catch (error) {
  console.error('Error details:', error.message);
  console.error('Stack trace:', error.stack);
}

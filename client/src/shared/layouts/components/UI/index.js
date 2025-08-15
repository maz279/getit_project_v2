// UI Component Library - GetIt Bangladesh Enterprise UI System
// Complete Amazon.com/Shopee.sg-Level UI Component Infrastructure

// Button Components
export * from './Button/Button';

// Input Components
export * from './Input/Input';

// Loading Components
export * from './Loading/Loading';

// Alert Components
export * from './Alert/Alert';

// Modal Components
export * from './Modal/Modal';

// Re-export all components as default collections
import Button from './Button/Button';
import Input from './Input/Input';
import Loading from './Loading/Loading';
import Alert from './Alert/Alert';
import Modal from './Modal/Modal';

export const UI = {
  Button,
  Input,
  Loading,
  Alert,
  Modal
};

export default UI;
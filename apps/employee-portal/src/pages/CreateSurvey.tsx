import React, { useState } from 'react';
import styled from 'styled-components';
import { useTypedTranslation } from '../hooks/useTypedTranslation';

const Container = styled.div`
  padding: ${props => props.theme.spacing.lg};
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Title = styled.h2`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const Label = styled.label`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.secondary.light};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.md};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }
`;

const TextArea = styled.textarea`
  padding: ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.secondary.light};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.md};
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  border: none;
  background-color: ${props => 
    props.variant === 'secondary' 
      ? props.theme.colors.secondary.main 
      : props.theme.colors.primary.main};
  color: white;

  &:hover {
    background-color: ${props => 
      props.variant === 'secondary' 
        ? props.theme.colors.secondary.dark 
        : props.theme.colors.primary.dark};
  }
`;

const CreateSurvey: React.FC = () => {
  const { t } = useTypedTranslation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAudience: '',
    deadline: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement survey creation logic
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Container>
      <Header>
        <Title>Create New Survey</Title>
      </Header>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="title">Survey Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter survey title"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="description">Description</Label>
          <TextArea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter survey description"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="targetAudience">Target Audience</Label>
          <Input
            id="targetAudience"
            name="targetAudience"
            value={formData.targetAudience}
            onChange={handleChange}
            placeholder="Enter target audience"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="deadline">Submission Deadline</Label>
          <Input
            id="deadline"
            name="deadline"
            type="date"
            value={formData.deadline}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <ButtonGroup>
          <Button type="submit">Create Survey</Button>
          <Button type="button" variant="secondary">Cancel</Button>
        </ButtonGroup>
      </Form>
    </Container>
  );
};

export default CreateSurvey; 
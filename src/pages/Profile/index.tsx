import React, { useCallback, useRef, FormEvent, ChangeEvent } from 'react';
import { FiMail, FiUser, FiLock, FiArrowLeft, FiCamera } from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import { Link, useHistory } from 'react-router-dom';

import api from '../../services/api';

import { useToast } from '../../hooks/toast';

import getValidationErrors from '../../utils/getValidationErrors';

import Input from '../../components/Input';
import Button from '../../components/Button';

import { Container, Content, AvatarInput } from './styles';
import { useAuth } from '../../hooks/auth';

interface SignUpFormData {
  name: string;
  email: string;

  old_password: string;
  password: string;
  password_confirmation: string;
}

const SignUp: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const { addToast } = useToast();
  const history = useHistory();
  const { user, updateUser } = useAuth();

  const handleSubmit = useCallback(
    async (data: SignUpFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required('Nome obrigatório'),
          email: Yup.string()
            .email('Digite um e-mail válido')
            .required('E-mail obrigatório'),
          old_password: Yup.string(),
          password: Yup.string().when('old_password', {
            is: val => Boolean(val.length),
            then: Yup.string().min(6, 'No mínimo 6 dígitos'),
            otherwise: Yup.string(),
          }),
          password_confirmation: Yup.string().oneOf(
            [Yup.ref('password')],
            'Confirmação incorreta',
          ),
        });

        await schema.validate(data, { abortEarly: false });

        const response = await api.put('/profile', data);

        updateUser(response.data);

        history.push('/');

        addToast({
          type: 'success',
          title: 'Perfil Atualizado!',
          description:
            'As informações do perfil foram atualizadas com sucesso!',
        });
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          return;
        }

        addToast({
          type: 'error',
          title: 'Erro ao atualizar perfil',
          description: 'Ocorreu um erro ao atualizar o perfil',
        });
      }
    },
    [addToast, history, updateUser],
  );

  const handleAvatarChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const data = new FormData();

        data.append('avatar', e.target.files[0]);

        try {
          const response = await api.patch('/users/avatar', data);

          updateUser(response.data);

          addToast({
            type: 'success',
            title: 'Avatar atualizado com sucesso!',
          });
        } catch (error) {
          addToast({
            type: 'error',
            title: 'Erro ao atualizar o avatar',
            description:
              'Ocorreu um erro, cheque sua conexão e tente novamente mais tarde',
          });
        }
      }
    },
    [addToast, updateUser],
  );

  return (
    <Container>
      <header>
        <div>
          <Link to="/dashboard">
            <FiArrowLeft />
          </Link>
        </div>
      </header>
      <Content>
        <Form
          onSubmit={handleSubmit}
          initialData={{
            name: user.name,
            email: user.email,
          }}
          ref={formRef}
        >
          <AvatarInput>
            <img src={user.avatar_url} alt={user.name} />
            <label htmlFor="avatar">
              <FiCamera />
              <input type="file" id="avatar" onChange={handleAvatarChange} />
            </label>
          </AvatarInput>

          <h1>Meu perfil</h1>

          <Input icon={FiUser} name="name" placeholder="Nome" />
          <Input icon={FiMail} name="email" placeholder="E-mail" />
          <Input
            containerStyle={{ marginTop: 24 }}
            icon={FiLock}
            name="old_password"
            type="password"
            placeholder="Senha atual"
          />
          <Input
            icon={FiLock}
            name="password"
            type="password"
            placeholder="Nova senha"
          />
          <Input
            icon={FiLock}
            name="password_confirmation"
            type="password"
            placeholder="Confirmar senha"
          />

          <Button type="submit">Confirmar mudanças</Button>
        </Form>
      </Content>
    </Container>
  );
};

export default SignUp;

/*
 * Este componente React implementa um acordeão, um elemento de interface do usuário
 * que permite exibir e ocultar seções de conteúdo de forma organizada.
 *
 * Visualmente, ele se apresenta como uma lista de itens onde cada item tem um título.
 * Ao clicar no título, o conteúdo associado se expande para ser visualizado,
 * e se recolhe quando desativado. Isso é útil para economizar espaço na tela
 * e apresentar informações de forma estruturada, como em seções de "Perguntas Frequentes"
 * ou para agrupar configurações e detalhes.
 *
 * No seu site, este componente é utilizado na página de perfil (`ProfilePage.jsx`)
 * para as seções de "Alterar Email" e "Alterar Senha", onde os campos de formulário
 * são exibidos ou ocultados conforme a interação do usuário.
 *
 *
 *
 *
 */



import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDownIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * @typedef {Object} AccordionProps
 * @extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
 */

/**
 * Um componente de acordeão que pode ser expandido e recolhido para exibir conteúdo.
 * Construído com Radix UI.
 * @param {AccordionProps} props - Propriedades do componente.
 * @returns {JSX.Element}
 */
function Accordion({
  ...props
}) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

/**
 * @typedef {Object} AccordionItemProps
 * @extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
 * @property {string} [className] - Classes CSS adicionais para estilização.
 */

/**
 * Um item individual dentro do componente Accordion.
 * @param {AccordionItemProps} props - Propriedades do componente.
 * @returns {JSX.Element}
 */
function AccordionItem({
  className,
  ...props
}) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('border-b last:border-b-0', className)}
      {...props} />
  );
}

/**
 * @typedef {Object} AccordionTriggerProps
 * @extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
 * @property {string} [className] - Classes CSS adicionais para estilização.
 * @property {React.ReactNode} [children] - O conteúdo a ser renderizado dentro do gatilho.
 */

/**
 * O gatilho que expande ou recolhe o conteúdo do AccordionItem.
 * @param {AccordionTriggerProps} props - Propriedades do componente.
 * @returns {JSX.Element}
 */
function AccordionTrigger({
  className,
  children,
  ...props
}) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180',
          className
        )}
        {...props}>
        {children}
        <ChevronDownIcon
          className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

/**
 * @typedef {Object} AccordionContentProps
 * @extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
 * @property {string} [className] - Classes CSS adicionais para estilização.
 * @property {React.ReactNode} [children] - O conteúdo a ser renderizado dentro do conteúdo do acordeão.
 */

/**
 * O conteúdo expansível do AccordionItem.
 * @param {AccordionContentProps} props - Propriedades do componente.
 * @returns {JSX.Element}
 */
function AccordionContent({
  className,
  children,
  ...props
}) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}>
      <div className={cn('pt-0 pb-4', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

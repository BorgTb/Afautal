import type { Schema, Struct } from '@strapi/strapi';

export interface FormularioCampo extends Struct.ComponentSchema {
  collectionName: 'components_formulario_campos';
  info: {
    description: 'Define un campo din\u00E1mico para el formulario del servicio';
    displayName: 'Campo de Formulario';
    icon: 'server';
  };
  attributes: {
    etiqueta: Schema.Attribute.String & Schema.Attribute.Required;
    nombre_variable: Schema.Attribute.String & Schema.Attribute.Required;
    opciones: Schema.Attribute.Text;
    requerido: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    tipo: Schema.Attribute.Enumeration<
      ['texto', 'textarea', 'fecha', 'seleccion']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'texto'>;
  };
}

export interface SharedAlerta extends Struct.ComponentSchema {
  collectionName: 'components_shared_alertas';
  info: {
    description: 'Caja de mensaje destacado (info, warning, success)';
    displayName: 'Alerta';
    icon: 'exclamation-triangle';
  };
  attributes: {
    mensaje: Schema.Attribute.Text & Schema.Attribute.Required;
    tipo: Schema.Attribute.Enumeration<
      ['info', 'warning', 'success', 'error']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'info'>;
    titulo: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedTextoRico extends Struct.ComponentSchema {
  collectionName: 'components_shared_texto_ricos';
  info: {
    description: 'Bloque de texto con formato libre';
    displayName: 'Texto Rico';
    icon: 'align-justify';
  };
  attributes: {
    contenido: Schema.Attribute.RichText & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'formulario.campo': FormularioCampo;
      'shared.alerta': SharedAlerta;
      'shared.texto-rico': SharedTextoRico;
    }
  }
}

import type { Schema, Struct } from '@strapi/strapi';

export interface FormularioCampoCheckbox extends Struct.ComponentSchema {
  collectionName: 'components_formulario_campo_checkboxes';
  info: {
    description: 'Casilla de verificaci\u00F3n \u00FAnica (s\u00ED/no)';
    displayName: 'Campo Checkbox';
    icon: 'checkSquare';
  };
  attributes: {
    etiqueta: Schema.Attribute.String & Schema.Attribute.Required;
    nombre_variable: Schema.Attribute.String & Schema.Attribute.Required;
    requerido: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    valor_defecto: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface FormularioCampoFecha extends Struct.ComponentSchema {
  collectionName: 'components_formulario_campo_fechas';
  info: {
    description: "Selector de fecha (input type='date')";
    displayName: 'Campo Fecha';
    icon: 'calendar';
  };
  attributes: {
    etiqueta: Schema.Attribute.String & Schema.Attribute.Required;
    nombre_variable: Schema.Attribute.String & Schema.Attribute.Required;
    requerido: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface FormularioCampoMensaje extends Struct.ComponentSchema {
  collectionName: 'components_formulario_campo_mensajes';
  info: {
    description: 'Texto informativo decorativo (no produce input)';
    displayName: 'Campo Mensaje';
    icon: 'information';
  };
  attributes: {
    contenido: Schema.Attribute.RichText & Schema.Attribute.Required;
  };
}

export interface FormularioCampoNumero extends Struct.ComponentSchema {
  collectionName: 'components_formulario_campo_numeros';
  info: {
    description: "Campo num\u00E9rico (input type='number')";
    displayName: 'Campo N\u00FAmero';
    icon: 'number';
  };
  attributes: {
    etiqueta: Schema.Attribute.String & Schema.Attribute.Required;
    max: Schema.Attribute.Decimal;
    min: Schema.Attribute.Decimal;
    nombre_variable: Schema.Attribute.String & Schema.Attribute.Required;
    placeholder: Schema.Attribute.String;
    requerido: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    valor_defecto: Schema.Attribute.Decimal;
  };
}

export interface FormularioCampoRadio extends Struct.ComponentSchema {
  collectionName: 'components_formulario_campo_radios';
  info: {
    description: 'Grupo de botones de opci\u00F3n (radio buttons)';
    displayName: 'Campo Radio';
    icon: 'checkCircle';
  };
  attributes: {
    etiqueta: Schema.Attribute.String & Schema.Attribute.Required;
    nombre_variable: Schema.Attribute.String & Schema.Attribute.Required;
    opciones: Schema.Attribute.Component<'formulario.opcion', true>;
    requerido: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    valor_defecto: Schema.Attribute.String;
  };
}

export interface FormularioCampoSelect extends Struct.ComponentSchema {
  collectionName: 'components_formulario_campo_selects';
  info: {
    description: 'Dropdown de selecci\u00F3n \u00FAnica';
    displayName: 'Campo Select';
    icon: 'list';
  };
  attributes: {
    etiqueta: Schema.Attribute.String & Schema.Attribute.Required;
    nombre_variable: Schema.Attribute.String & Schema.Attribute.Required;
    opciones: Schema.Attribute.Component<'formulario.opcion', true>;
    requerido: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    valor_defecto: Schema.Attribute.String;
  };
}

export interface FormularioCampoSwitch extends Struct.ComponentSchema {
  collectionName: 'components_formulario_campo_switches';
  info: {
    description: 'Interruptor de dos estados (s\u00ED/no)';
    displayName: 'Campo Switch';
    icon: 'toggleLeft';
  };
  attributes: {
    etiqueta: Schema.Attribute.String & Schema.Attribute.Required;
    nombre_variable: Schema.Attribute.String & Schema.Attribute.Required;
    valor_defecto: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface FormularioCampoTextarea extends Struct.ComponentSchema {
  collectionName: 'components_formulario_campo_textareas';
  info: {
    description: 'Campo de texto largo (textarea)';
    displayName: 'Campo Textarea';
    icon: 'fileText';
  };
  attributes: {
    etiqueta: Schema.Attribute.String & Schema.Attribute.Required;
    filas: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<4>;
    nombre_variable: Schema.Attribute.String & Schema.Attribute.Required;
    placeholder: Schema.Attribute.String;
    requerido: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    valor_defecto: Schema.Attribute.String;
  };
}

export interface FormularioCampoTexto extends Struct.ComponentSchema {
  collectionName: 'components_formulario_campo_textos';
  info: {
    description: "Campo de texto corto (input type='text')";
    displayName: 'Campo Texto';
    icon: 'cursorText';
  };
  attributes: {
    etiqueta: Schema.Attribute.String & Schema.Attribute.Required;
    nombre_variable: Schema.Attribute.String & Schema.Attribute.Required;
    placeholder: Schema.Attribute.String;
    requerido: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    valor_defecto: Schema.Attribute.String;
  };
}

export interface FormularioCampoUpload extends Struct.ComponentSchema {
  collectionName: 'components_formulario_campo_uploads';
  info: {
    description: 'Subida de archivos a la librer\u00EDa multimedia';
    displayName: 'Campo Upload';
    icon: 'upload';
  };
  attributes: {
    etiqueta: Schema.Attribute.String & Schema.Attribute.Required;
    multiple: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    nombre_variable: Schema.Attribute.String & Schema.Attribute.Required;
    requerido: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface FormularioOpcion extends Struct.ComponentSchema {
  collectionName: 'components_formulario_opciones';
  info: {
    description: 'Una opci\u00F3n dentro de un select o radio';
    displayName: 'Opci\u00F3n';
    icon: 'bulletList';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    valor: Schema.Attribute.String & Schema.Attribute.Required;
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

export interface SharedContenido extends Struct.ComponentSchema {
  collectionName: 'components_shared_contenidos';
  info: {
    description: 'Bloque de texto con formato libre';
    displayName: 'Contenido';
    icon: 'align-justify';
  };
  attributes: {
    contenido: Schema.Attribute.RichText & Schema.Attribute.Required;
  };
}

export interface SharedRedSocial extends Struct.ComponentSchema {
  collectionName: 'components_shared_red_sociales';
  info: {
    description: 'Enlace a una red social de la asociaci\u00F3n';
    displayName: 'Red Social';
    icon: 'share-alt';
  };
  attributes: {
    nombre: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedTextoRico extends Struct.ComponentSchema {
  collectionName: 'components_shared_texto_ricos';
  info: {
    description: 'Bloque de texto con formato libre';
    displayName: 'Texto';
    icon: 'align-justify';
  };
  attributes: {
    contenido: Schema.Attribute.RichText & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'formulario.campo-checkbox': FormularioCampoCheckbox;
      'formulario.campo-fecha': FormularioCampoFecha;
      'formulario.campo-mensaje': FormularioCampoMensaje;
      'formulario.campo-numero': FormularioCampoNumero;
      'formulario.campo-radio': FormularioCampoRadio;
      'formulario.campo-select': FormularioCampoSelect;
      'formulario.campo-switch': FormularioCampoSwitch;
      'formulario.campo-textarea': FormularioCampoTextarea;
      'formulario.campo-texto': FormularioCampoTexto;
      'formulario.campo-upload': FormularioCampoUpload;
      'formulario.opcion': FormularioOpcion;
      'shared.alerta': SharedAlerta;
      'shared.contenido': SharedContenido;
      'shared.red-social': SharedRedSocial;
      'shared.texto-rico': SharedTextoRico;
    }
  }
}

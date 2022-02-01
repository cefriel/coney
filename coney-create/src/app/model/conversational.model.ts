export enum ENUM_OPERATION_FEEDBACK {
  SUCCESS = 'SUCCESS',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

export enum ENUM_CONV_STATUS {
  ALL = 'all',
  STATUS = 'status',
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
  SAVED = 'saved'
}

export enum ENUM_CHAT {
  CONV_ID = 'conversationId',
  STATUS = 'status',
  TITLE = 'title',
  ACCESS_LEVEL = "accessLevel",
  PROJECT = 'projectName',
  LANGUAGE = 'lang'
}

export enum ENUM_RETE_COMPONENT {
  ALL = 'Any',
  ANSWER_MULTIPLE = 'Answer [multiple]',
  ANSWER_OPEN = 'Answer [open]',
  ANSWER_CHECKBOX = 'Answer [checkbox]',
  QUESTION_TEXT = 'Question [text]',
  TALK_LINK = 'Talk [link]',
  TALK_TEXT = 'Talk [text]',
  TALK_URL = 'Talk [imageUrl]'
}

export enum ENUM_NODE_TYPE{
  ALL = 'Type',
  ANSWER = 'Answer',
  QUESTION = 'Question',
  TALK = 'Talk'
}

export enum ENUM_NODE_SUBTYPE {
  ALL = 'Subtype',
  MULTIPLE = 'multiple',
  SINGLE = 'single',
  CHECKBOX = 'checkbox',
  TEXT = 'text',
  LINK = 'link',
  URL = 'imageUrl'
}

export enum ENUM_NODE_COMPONENT {
  ID = 'block_id',
  TYPE = 'type',
  SUBTYPE = 'subtype',
  TEXT = 'text',
  LINK = 'link'
}

export enum ENUM_SUCCESS {
  SAVED = 'Saved succesfully',
  PUBLISHED = 'Published succesfully',
  UNPUBLISHED = 'Unpublished succesfully',
  DELETED = 'Deleted succesfully'
}

export enum ENUM_TEMPLATE_FEEDBACK{
  TEXT_TYPE = "Text and type are mandatory fields",
  NO_DATA = "No data inserted",
  MULTIPLE_VALUES = "Multiple same values found in answers"
}

export enum ENUM_INFO {
  MULTI_TYPE = 'You cannot have different answer types for the same question',
  MULTI_ELEMENT = 'You can connect just one block of this type',
  SINGLE_ANSWER = 'This question requires a single answer',
  MULTIPLE_ANSWER = 'This question requires multiple answers',
  MAX_RANGE = 'You reached the maximum number of blocks you can connect'
}

export enum ENUM_WARNING {
  MISSING_TYPE = 'Missing type',
  MISSING_TITLE = 'Missing title',
  MULTIPLE_STARTS = 'More than one starting node found',
  ISOLATED_NODE = 'Make sure that all nodes are connected',
  NO_STARTS = 'No starting node found',
  LOOPS = 'Loops detected, please remove them before publishing',
  SAME_VALUE = 'Same order values found in different answers to question',
  NO_TEXT = 'Some option-answers are missing the text',
  QUESTION_END = 'You can NOT finish a conversation with a question ',
  NO_ERRORS = 'Error check completed, OK',
  FIELD_MISSING = 'Fill all the necessary fields'
}

export enum ENUM_ERROR {
  RES_409 = 'This name already exists. Please, choose another one.',
  RES_404 = 'Resource not Found',
  RES_404_NEXT = 'Single block added',
  NOT_DELETED = 'An error occurred, chat not deleted',
  GENERIC = 'Something went wrong'
}

export const RETE_ID = 'demo@0.1.0';

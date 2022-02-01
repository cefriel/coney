package com.cefriel.coneyapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@SuppressWarnings("serial")
@ResponseStatus(value=HttpStatus.BAD_REQUEST)
public class ParsingException extends Exception {

	public ParsingException() {
		super();
	}

	public ParsingException(String message) {
		super(message);
	}

}

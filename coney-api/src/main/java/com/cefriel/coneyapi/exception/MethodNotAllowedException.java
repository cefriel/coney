package com.cefriel.coneyapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@SuppressWarnings("serial")
@ResponseStatus(value=HttpStatus.METHOD_NOT_ALLOWED)
public class MethodNotAllowedException extends Exception {
 
	public MethodNotAllowedException() {
		super();
	}

	public MethodNotAllowedException(String message) {
		super(message);
	}

}

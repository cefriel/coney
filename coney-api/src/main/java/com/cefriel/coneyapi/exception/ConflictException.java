package com.cefriel.coneyapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@SuppressWarnings("serial")
@ResponseStatus(value = HttpStatus.CONFLICT)
public class ConflictException extends Exception {

	public ConflictException() {
		super();
	}

	public ConflictException(String message) {
		super(message);
	}

}

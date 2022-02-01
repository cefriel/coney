package com.cefriel.coneyapi.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cefriel.coneyapi.exception.ConflictException;
import com.cefriel.coneyapi.exception.ErrorView;
import com.cefriel.coneyapi.exception.MethodNotAllowedException;
import com.cefriel.coneyapi.exception.ParsingException;
import com.cefriel.coneyapi.exception.ResourceNotFoundException;

@RestController
@ControllerAdvice
public class ExceptionHandlerController {

	@ExceptionHandler(ResourceNotFoundException.class)
	@ResponseStatus(value = HttpStatus.NOT_FOUND)
	@ResponseBody
	public ErrorView handleResourceNotFoundException(Exception ex) {

		ErrorView error = new ErrorView();
		error.setCode(HttpStatus.NOT_FOUND.toString());
		error.setDescr(ex.getMessage());
		return error;
	}

	@ExceptionHandler(ParsingException.class)
	@ResponseStatus(value = HttpStatus.BAD_REQUEST)
	@ResponseBody
	public ErrorView handleParsingException(Exception ex) {

		ErrorView error = new ErrorView();
		error.setCode(HttpStatus.BAD_REQUEST.toString());
		error.setDescr(ex.getMessage());
		return error;
	}
	
	@ExceptionHandler(MethodNotAllowedException.class)
	@ResponseStatus(value = HttpStatus.METHOD_NOT_ALLOWED)
	@ResponseBody
	public ErrorView handleMethodNotAllowedException(Exception ex) {

		ErrorView error = new ErrorView();
		error.setCode(HttpStatus.METHOD_NOT_ALLOWED.toString());
		error.setDescr(ex.getMessage());
		return error;
	}
	
	@ExceptionHandler(ConflictException.class)
	@ResponseStatus(value = HttpStatus.CONFLICT)
	@ResponseBody
	public ErrorView handleConflictException(Exception ex) {

		ErrorView error = new ErrorView();
		error.setCode(HttpStatus.CONFLICT.toString());
		error.setDescr(ex.getMessage());
		return error;
	}
	
	@ExceptionHandler(Exception.class)
	@ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
	@ResponseBody
	public ErrorView handleInternalServerErrorException(Exception ex) {
		ErrorView error = new ErrorView();
		error.setCode(HttpStatus.INTERNAL_SERVER_ERROR.toString());
		error.setDescr(ex.getMessage());
		return error;
	}
}

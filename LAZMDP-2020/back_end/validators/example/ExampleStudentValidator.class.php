<?php
namespace LAZ\example\validators;

use \Exception;
use LAZ\example\businessObjects\ExampleStudent;
use LAZ\objects\library\InvalidRequestException;

class ExampleStudentValidator {

    public static function validate(ExampleStudent $student, $isNew = false) {
        $pattern = self::getRegex($minLength = 2, $maxLength = 50);

        if (!self::validString($pattern, $student->passwordText)) {
            // todo: Invalid Argument Exception instead
            throw new InvalidRequestException("Password Should Be An Alphanumeric Field Between 2 and 50 characters");
        }

        if (!self::validString($pattern, $student->screenName)) {
            throw new InvalidRequestException("Screen Name Should Be An Alphanumeric Field Between 2 and 50 characters");
        }

        if ($student->studentFirstName && !self::validString($pattern, $student->studentFirstName)) {
            throw new InvalidRequestException("Student First Name Should Be An Alphanumeric Field Between 2 and 50 characters");
        }

        if ($student->studentLastName && !self::validString($pattern, $student->studentLastName)) {
            throw new InvalidRequestException("Student Last Name Should Be An Alphanumeric Field Between 2 and 50 characters");
        }

        if ($isNew && $student->studentId) {
            throw new InvalidRequestException("Student Id Must Be Empty For a New Example Student");
        }

        if (!$isNew && !$student->studentId) {
            throw new InvalidRequestException("Student Id Is Required For Existing Students");
        }

        if ($student->studentId && !is_int($student->studentId)) {
            throw new InvalidRequestException("Student Id Should Be An Integer");
        }

        return true;
    }

    private static function validString($pattern, $input) {
        return preg_match($pattern, $input);
    }

    private static function getRegex($minLength, $maxLength) {
        return "/^[ a-zA-Z0-9.-]{" . $minLength . "," . $maxLength . "}$/";
    }
}

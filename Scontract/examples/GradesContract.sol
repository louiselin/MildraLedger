pragma solidity ^0.4.4;


contract GradesContract {
    address public teacher;

    mapping (address => Grades) studentGrades;

    address[] studentIds;

    struct Grades {
        uint ChineseGrade;
        uint EnglishGrade;
        uint MathGrade;
        bool Registered;
    }

    function GradesContract() {
        teacher = msg.sender;
    }

    function isTeacher() returns (bool) {
        return (msg.sender == teacher);
    }

    function isGradesOf(address input) returns (bool) {
        return (msg.sender == input);
    }

    function putGrade(address studentId, uint chineseGrade, uint englishGrade, uint mathGrade) {
        // check permission
        // only the teacher can call this method
        if (!isTeacher()) {
            throw;
        }

        // if it is first time registered
        if (studentGrades[studentId].Registered == false) {
            // then add to Ids array for tracking or iterating
            studentIds.push(studentId);
        }

        // put to mapping, or if it is already registered then overwrite it
        studentGrades[studentId] = Grades({
            ChineseGrade: chineseGrade,
            EnglishGrade: englishGrade,
            MathGrade:    mathGrade,
            Registered:   true
        });
    }

    function getGrade(address studentId) returns (uint ChineseGrade, uint EnglishGrade, uint MathGrade) {
        // check permission
        // only the student who owns these grades or the teacher can call this method
        if (!(isGradesOf(studentId) || isTeacher())) {
            throw;
        }

        var theGrades = studentGrades[studentId];

        ChineseGrade = theGrades.ChineseGrade;
        EnglishGrade = theGrades.EnglishGrade;
        MathGrade    = theGrades.MathGrade;
    }

    function getGradesSum(address studentId) returns (uint) {
        // check permission
        // only the student who owns these grades or the teacher can call this method
        if (!(isGradesOf(studentId) || isTeacher())) {
            throw;
        }

        var theGrades = studentGrades[studentId];

        return theGrades.ChineseGrade + theGrades.EnglishGrade + theGrades.MathGrade;
    }

    function getGradesAverage(address studentId) returns (uint) {
        // check permission
        // only the student who owns these grades or the teacher can call this method
        if (!(isGradesOf(studentId) || isTeacher())) {
            throw;
        }

        return getGradesSum(studentId) / 3;
    }

    function getClassGradesAverage() returns (uint) {
        // check permission
        // only the teacher can call this method
        if (!isTeacher()) {
            throw;
        }

        // iterate all the grades and calculate its average
        uint sum = 0;
        var studentNum = studentIds.length;
        for (var i = 0; i < studentNum; i++) {
            sum = sum + getGradesSum(studentIds[i]);
        }

        return (sum / studentNum) / 3;
    }
}

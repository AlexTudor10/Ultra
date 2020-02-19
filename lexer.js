//   FIXME: 
// > isMatchingBrackets also verifies comments and strings
// > check matchingBrackets right before pushing to AST

COMPILER.prototype.Lex = function(content) {
    if (this.status) {
        console.log("^$: Starting Lexer...")
        console.log("^$: Beginning To Lex...")
        console.log("^$: Splitting Code Text Into Characters...")
        let charList = content.innerText.split(''),
            reachedHalf = false;
        // if (this.isMatchingBrackets(charList)) {
        console.log("^$: Converting Characters To Tokens...")
        for (let i = 0; i < charList.length && this.status; i++) {
            if (i > charList.length / 2 && !reachedHalf) {
                console.log("^$: Almost There...")
                reachedHalf = true;
            }
            switch (true) {
                case this.isChar("commentSingleLine", charList, i):
                    i = this.useCharsFor("commentSingleLine", charList, i);
                    break;
                case this.isChar("string", charList, i):
                    i = this.useCharsFor("string", charList, i);
                    break;
                case this.isChar("identifier", charList, i):
                    i = this.useCharsFor("identifier", charList, i);
                    break;
                case this.isChar("number", charList, i):
                    i = this.useCharsFor("number", charList, i);
                    break;
                case this.isChar("operator", charList, i):
                    i = this.useCharsFor("operator", charList, i);
                    break;
                case this.isChar("punctuator", charList, i):
                    i = this.useCharsFor("punctuator", charList, i);
                    break;
            }
        }
        if (this.status) {
            console.log("^$: All Tokens Have Been Obtained:", this.TokenHolder, "\n^$: Position Of The Code's EOI (End Of Input) =", charList.length);
            console.log("^$: Exiting Lexer...")
            console.log("^$: Trying To Access Parser...")
        }
        return this.TokenHolder;
        // } else {
        //     throw new FatalError("Missing closing brackets in code")
        // }
    } else {
        throw new FatalError("Something went badly wrong! (in Lexer)")
    }
};
COMPILER.prototype.isChar = function(type, charList, charIndex) {
    let foundChar = false;
    switch (type) {
        case "commentSingleLine":
            if (/\//.test(charList[charIndex]) && charList[charIndex + 1] && /\//.test(charList[charIndex + 1]))
                foundChar = true;
            break;
        case "string":
            if (/\"/.test(charList[charIndex]))
                foundChar = true;
            break;
        case "identifier":
            if (/[A-Za-z_]/.test(charList[charIndex]))
                foundChar = true;
            break;
        case "number":
            if (/[0-9]|\.|\+|\-/.test(charList[charIndex]))
                foundChar = true;
            // DONE: > numbers can have first character +/-
            break;
        case "operator":
            if (/\+|\-|\*|\/|\%|\=|\<|\>|\^/.test(charList[charIndex]))
                foundChar = true;
            // TODO: if( /is/.test(charList[charIndex] + charList[charIndex + 1] ) ... (is) = (==)
            break;
        case "punctuator":
            if (/\,|\[|\]|\{|\}|\?|\:|\;/.test(charList[charIndex]))
                foundChar = true;
            break;

    }
    return foundChar;
}
COMPILER.prototype.useCharsFor = function(type, charList, charIndex) {
    let token = "";
    switch (type) {
        case "commentSingleLine":
            do { charIndex++; } while (charList[charIndex] != "\n" && charIndex < charList.length);
            break;
        case "string":
            token += "\"";
            do {
                token += charList[++charIndex];
                if (charIndex == charList.length) {
                    console.warn("Error in lexer > useCharsFor > string"); // > see error in configCompiler comments
                    // throw new Error("String Closing Quote Is Missing And Already Reached End Of Input");
                    break;
                }
            } while (charList[charIndex] != "\"");

            this.TokenHolder.push({
                content: token,
                denominal: "string"
            });
            /*  TODO:
                > by now, it does not allow escape sequences
                > solution: has to verify behind 1 char in both isChar() and useCharsFor()
                > forward: check for \" and \' (important), \n, \r etc.
            */
            charIndex++; // > move after last "
            break;
        case "identifier":
            while (/[A-Za-z0-9_]/.test(charList[charIndex]) && charIndex < charList.length)
                token += charList[charIndex++];
            this.TokenHolder.push({
                content: token,
                denominal: this.keywordList.includes(token) ? "keyword" : "identifier"
            })
            charIndex--; // TODO: find out why :)
            break;
        case "number":
            let dot = false;
            token += charList[charIndex++]; // for sure no EOI or no match
            while (/[0-9]|\./.test(charList[charIndex]) && charIndex < charList.length) {
                if (charList[charIndex] == ".")
                    if (!dot)
                        dot = true;
                    else {
                        console.warn("Error in lexer > useCharsFor > number"); // > see error in configCompiler comments
                        //throw new FatalError("Number Is Containing Two Dots In Componence");
                    }
                token += charList[charIndex++];
                // TODO: +24 is recognized as nr, + 24 (with space) isn't, upgrade program so it catches only useful spaces in number token
            }
            this.TokenHolder.push({
                content: token,
                denominal: "number"
            })
            charIndex--; // TODO: find out why :)
            /* TODO:
                > number format allowed now is [0-9]+\.*[0-9]*
                > can be added scientific (E notation) and / or hexa (binary? octal?)
            */
            break;
        case "operator":
            token += charList[charIndex++];
            this.TokenHolder.push({
                    content: token,
                    denominal: "operator"
                })
                /* TODO:
                    > while (/\+|\-|\*|\/|\%|\=|\<|\>|\^/.test(charList[charIndex]) 
                    > && this.validOperatorList.includes(token + charList[charIndex])) {
                    > ...same code (to add operators like ++, -=, !=, beware putting parens in op group => *) valid operator))
                    > }
                */
            break;
        case "punctuator":
            token += charList[charIndex++];
            this.TokenHolder.push({
                content: token,
                denominal: "punctuator"
            })
            break;

    }
    return charIndex;
}
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:mf="http://example.com/mf"
    expand-text="yes"
    exclude-result-prefixes="#all"
    version="3.0">
    
    <xsl:param name="format-map" as="map(xs:integer, xs:string)"
        select="map { 1 : 'a', 2 : '1', 3 : 'a' }"/>
    
    <xsl:function name="mf:format" as="xs:string">
        <xsl:param name="number" as="xs:integer"/>
        <xsl:param name="level" as="xs:integer"/>
        <xsl:variable name="formatted-number"
            select="format-integer($number, $format-map($level))"/>
        <xsl:sequence
            select="if ($level = 1)
            then  $formatted-number || '.'
            else  '(' || $formatted-number || ')'"/>
    </xsl:function>
    
    <xsl:function name="mf:group" as="node()*">
        <xsl:param name="items" as="element(li)*"/>
        <xsl:param name="level" as="xs:integer"/>
        <xsl:where-populated>
            <ul type="bull{$level}">
                <xsl:for-each-group select="$items" group-starting-with="li[@type = 'bull' || $level]">
                    <xsl:copy>
                        <xsl:apply-templates select="node()|@*, mf:group(tail(current-group()), $level + 1)"/>
                    </xsl:copy>  
                </xsl:for-each-group>  
            </ul>
        </xsl:where-populated>
    </xsl:function>
    
    <xsl:mode on-no-match="shallow-copy"/>
    
    
    <xsl:template match="ullist">
        <xsl:copy>
            <xsl:sequence select="mf:group(li, 1)"/>
        </xsl:copy>
    </xsl:template>
    
    
</xsl:stylesheet>

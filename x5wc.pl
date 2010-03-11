#!/usr/bin/perl

use strict;
use warnings;

use XML::LibXML;
use XML::LibXML::XPathContext;

my $src = shift;
die "Usage: $0 document\n" unless $src and -e $src;

my $doc = XML::LibXML->new->parse_file($src);
my $xc = XML::LibXML::XPathContext->new($doc);
$xc->registerNs(x => "http://www.w3.org/1999/xhtml");
my $txt = $xc->findvalue("//x:body//text()");
$txt =~ s/\s+/ /g;
my $signes = length $txt;
my $words = scalar(my @tmp = split " ", $txt);
print <<"END";
Signes: $signes
Mots:   $words
END
